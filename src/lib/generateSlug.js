import slugify from 'slugify';
import Post from '../models/Post.js';

export const generateUniqueSlug = async title => {
  const baseSlug = slugify(title, { lower: true, strict: true });
  const fallback = baseSlug || Date.now().toString();

  let slug = fallback;
  let counter = 1;

  while (await Post.exists({ slug })) {
    slug = `${fallback}-${counter}`;
    counter++;
  }

  return slug;
};
