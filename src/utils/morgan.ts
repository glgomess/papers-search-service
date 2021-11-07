import morgan from 'morgan';

// Custom token to convert date to GMT-3.
morgan.token('date', () => {
  const p = new Date().toString().replace(/[A-Z]{3}\+/, '+').split(/ /);
  return (`${p[2]}/${p[1]}/${p[3]} ${p[4]}`);
});

/**
 * The logger itself. Any routes or conditions that should not be logged
 * (e.g: search for keywords) can be inserted in the skip function.
 */
const morganMiddleware = morgan(
  '[:date] :method :url :status', {
    skip(req) {
      return req.url.includes('/keywords') || req.url.includes('/authors');
    },
  },
);

export default morganMiddleware;
