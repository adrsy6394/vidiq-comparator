/**
 * Middleware to validate incoming request data using Zod schema
 * @param {import('zod').ZodSchema} schema 
 */
export const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    next(error);
  }
};

export default validateRequest;
