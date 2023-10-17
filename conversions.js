/**
 * Returns {@link value} but with `null` and `undefined` removed from its type
 * union. This is safe because we throw if the value is `null` or `undefined`.
 *
 * @template T
 * @param {T} value
 * @returns {NonNullable<T>}
 */
export function throwIfNull(value) {
  if (value == null) throw new Error("throwIfNull received a null value.");
  return value;
}
