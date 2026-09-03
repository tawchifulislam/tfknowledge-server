export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on our end';

  res.status(statusCode).json({ message });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};
