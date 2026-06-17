/**
 * Sanitize user input to prevent XSS and injection attacks
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, (match) => (match === '"' ? '&quot;' : '&#39;')) // Escape quotes
    .trim()
    .substring(0, 5000); // Limit length
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate message content
 * @param {string} message - Message to validate
 * @returns {Object} Validation result
 */
function validateMessage(message) {
  const errors = [];

  if (!message || typeof message !== 'string') {
    errors.push('Message must be a non-empty string');
  }

  if (message.length < 2) {
    errors.push('Message must be at least 2 characters');
  }

  if (message.length > 5000) {
    errors.push('Message must be less than 5000 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize SQL-like strings
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeSQLInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .substring(0, 1000); // Limit length
}

module.exports = {
  sanitizeInput,
  validateEmail,
  validateMessage,
  sanitizeSQLInput,
};
