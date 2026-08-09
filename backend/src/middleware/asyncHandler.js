// Wraps an async route/controller so rejected promises reach errorHandler
// instead of crashing the process (Express 4 does not do this automatically).
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
