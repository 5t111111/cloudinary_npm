/**
 * Returns an ensureOption function that relies on the provided `defaultOptions` argument
 * for default values.
 * @private
 * @param {object} defaultOptions
 * @return {function(*, *, *=): *}
 */
function defaults(defaultOptions) {
  return function ensureOption(options, name, defaultValue) {
    let value = options[name] || defaultOptions[name] || defaultValue;
    if (value === undefined) {
      throw `Must supply ${name}`;
    }
    return value;
  };
}

/**
 * Get the option `name` from options, the global config, or the default value.
 * If the value is not defined and no default value was provided,
 * the method will throw an error.
 * @private
 * @param {object} options
 * @param {string} name
 * @param {*} [defaultValue]
 * @return {*} the value associated with the provided `name` or the default.
 *
 */
module.exports = defaults({});

module.exports.defaults = defaults;
