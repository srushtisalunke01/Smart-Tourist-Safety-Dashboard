/**
 * Centralized Security Middleware for SafeTour AI
 * Handles:
 * 1. NoSQL Injection Prevention (Mongo Sanitizer)
 * 2. Cross-Site Scripting Prevention (XSS Filter)
 */

function sanitizeMongoObject(obj) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        sanitizeMongoObject(obj[i]);
      }
    }
  } else if (obj !== null && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeMongoObject(obj[key]);
      }
    });
  }
}

function cleanHTMLTags(str) {
  // Strip out HTML markup to block script injections
  return str.replace(/<[^>]*>/g, '');
}

function sanitizeXSSValue(val) {
  if (typeof val === 'string') {
    return cleanHTMLTags(val);
  } else if (Array.isArray(val)) {
    return val.map(sanitizeXSSValue);
  } else if (val !== null && typeof val === 'object') {
    Object.keys(val).forEach(key => {
      val[key] = sanitizeXSSValue(val[key]);
    });
  }
  return val;
}

/**
 * Strips keys starting with '$' or containing '.' from request query, params, and body
 */
exports.mongoSanitize = (req, res, next) => {
  if (req.body) sanitizeMongoObject(req.body);
  if (req.query) sanitizeMongoObject(req.query);
  if (req.params) sanitizeMongoObject(req.params);
  next();
};

/**
 * Strips HTML markup from all string values inside request body
 */
exports.xssSanitize = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitizeXSSValue(req.body[key]);
    });
  }
  next();
};
