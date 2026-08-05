const validate = (requiredFields) => {
  return (req, res, next) => {
    const missing = [];
    requiredFields.forEach((field) => {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return res.status(400).json({
        message: `Validation failed: Missing required fields: ${missing.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  validate
};
