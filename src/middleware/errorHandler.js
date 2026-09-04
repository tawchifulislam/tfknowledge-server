export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode
    ? err.message
    : 'Something went wrong on our end';

  res.status(statusCode).json({ message });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};
