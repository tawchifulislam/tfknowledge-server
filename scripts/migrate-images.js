// One-time migration: imgBB (i.ibb.co) -> Cloudinary, then rewrite links in MongoDB.
//
// Needs in .env (or the shell): MONGODB_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET
//
//   node scripts/migrate-images.js --dry-run      look only, change nothing
//   node scripts/migrate-images.js                do the migration
//   node scripts/migrate-images.js --skip=abc123  leave any URL containing "abc123" alone (repeatable)
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const IBB_URL = /https?:\/\/i\.ibb\.co\/[^\s"'<>)\\]+/g;

export const extractUrls = text => (text ? text.match(IBB_URL) || [] : []);

export const replaceUrls = (text, map) =>
  text ? text.replace(IBB_URL, m => map.get(m) ?? m) : text;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Cloudinary fetches the image from the URL itself, so nothing is downloaded here.
export const uploadRemote = async (url, cloud, preset) => {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const fd = new FormData();
      fd.append('file', url);
      fd.append('upload_preset', preset);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
        { method: 'POST', body: fd },
      );
      const data = await res.json();
      if (!res.ok || !data.secure_url) {
        throw new Error(data?.error?.message || `HTTP ${res.status}`);
      }
      return data.secure_url;
    } catch (err) {
      lastErr = err;
      await sleep(attempt * 2000);
    }
  }
  throw lastErr;
};

// Is the old URL actually serving an image right now?
const probe = async url => {
  try {
    const res = await fetch(url);
    res.body?.cancel();
    return {
      ok: res.ok,
      status: res.status,
      type: res.headers.get('content-type') || '',
      size: res.headers.get('content-length') || '?',
    };
  } catch (err) {
    return { ok: false, status: 0, type: '', size: '?', error: err.message };
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run');
  const skips = args
    .filter(a => a.startsWith('--skip='))
    .map(a => a.slice('--skip='.length));

  const {
    MONGODB_URI,
    CLOUDINARY_CLOUD_NAME: cloud,
    CLOUDINARY_UPLOAD_PRESET: preset,
  } = process.env;

  if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');
  if (!dry && (!cloud || !preset)) {
    throw new Error(
      'CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET are required',
    );
  }

  const mongoose = (await import('mongoose')).default;
  const Post = (await import('../src/models/Post.js')).default;
  await mongoose.connect(MONGODB_URI, { dbName: 'tfknowledgedb' });

  const posts = await Post.find({
    $or: [{ coverImage: /i\.ibb\.co/ }, { content: /i\.ibb\.co/ }],
  })
    .select('title slug status coverImage content')
    .lean();

  // url -> slugs that use it
  const usage = new Map();
  for (const p of posts) {
    for (const url of [...extractUrls(p.coverImage), ...extractUrls(p.content)]) {
      if (skips.some(s => url.includes(s))) continue;
      if (!usage.has(url)) usage.set(url, new Set());
      usage.get(url).add(p.slug);
    }
  }

  console.log(`Posts with imgBB images: ${posts.length}`);
  console.log(`Unique imgBB image URLs: ${usage.size}`);
  if (skips.length) console.log(`Skipping URLs containing: ${skips.join(', ')}`);
  console.log();

  if (dry) {
    for (const [url, slugs] of usage) {
      const r = await probe(url);
      const tag = r.ok && r.type.startsWith('image/') ? 'OK ' : 'BAD';
      console.log(
        `[${tag}] ${r.status} ${r.type || '-'} ${r.size}B  ${url}\n        used in: ${[...slugs].join(', ')}`,
      );
    }
    console.log(
      '\nDry run only, nothing changed.\n' +
        'Open each post in the browser first. If an image shows imgBB\'s "service unavailable"\n' +
        'picture, imgBB may be serving that placeholder as a normal image. Exclude it with\n' +
        '--skip=<part of its URL> and re-upload the original through the admin panel instead.',
    );
    await mongoose.disconnect();
    return;
  }

  // Backup before touching anything
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join('scripts', `image-migration-backup-${stamp}.json`);
  fs.writeFileSync(
    backupFile,
    JSON.stringify(
      posts.map(p => ({
        _id: p._id,
        slug: p.slug,
        coverImage: p.coverImage,
        content: p.content,
      })),
      null,
      2,
    ),
  );
  console.log(`Backup written: ${backupFile}\n`);

  const map = new Map();
  const failed = [];
  let i = 0;
  for (const [url] of usage) {
    i++;
    const r = await probe(url);
    if (!r.ok || !r.type.startsWith('image/')) {
      failed.push({ url, reason: `old URL not serving an image (status ${r.status}, ${r.type || 'no type'})` });
      console.log(`(${i}/${usage.size}) SKIP ${url}`);
      continue;
    }
    try {
      const newUrl = await uploadRemote(url, cloud, preset);
      map.set(url, newUrl);
      console.log(`(${i}/${usage.size}) ok   ${url}\n          -> ${newUrl}`);
    } catch (err) {
      failed.push({ url, reason: err.message });
      console.log(`(${i}/${usage.size}) FAIL ${url} (${err.message})`);
    }
  }

  let updated = 0;
  for (const p of posts) {
    const coverImage = replaceUrls(p.coverImage, map);
    const content = replaceUrls(p.content, map);
    if (coverImage === p.coverImage && content === p.content) continue;
    // timestamps: false keeps updatedAt as it was
    await Post.updateOne(
      { _id: p._id },
      { $set: { coverImage, content } },
      { timestamps: false },
    );
    updated++;
  }

  console.log(`\nMigrated images: ${map.size}`);
  console.log(`Posts updated:   ${updated}`);
  if (failed.length) {
    console.log(`\nNot migrated (${failed.length}), links left unchanged:`);
    for (const f of failed) console.log(`  ${f.url}\n    reason: ${f.reason}`);
    console.log('\nRe-upload these originals through the admin panel.');
  }

  await mongoose.disconnect();
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
}
