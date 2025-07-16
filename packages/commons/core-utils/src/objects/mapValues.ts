/**
 * [See lodash `mapValue`](https://github.com/lodash/lodash/blob/6a2cc1dfcf7634fea70d1bc5bd22db453df67b42/src/mapValue.ts)
 *
 * Creates an object with the same keys as `object` and values generated
 * by running each own enumerable string keyed property of `object` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, key, object).
 *
 * @since 2.4.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns the new mapped object.
 * @see mapKeys
 * @example
 *
 * const users = {
 *   'fred':    { 'user': 'fred',    'age': 40 },
 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
 * }
 *
 * mapValue(users, ({ age }) => age)
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 */
export function mapValues<OldT, NewT>(
    object: Record<string | number | symbol, OldT>,
    iteratee: (value: OldT, key: string | number | symbol, obj: Record<string | number | symbol, OldT>) => NewT
): Record<string | number | symbol, NewT> {
    object = Object(object);
    const result: Record<keyof typeof object, NewT> = {};

    Object.keys(object).forEach((key) => {
        result[key] = iteratee(object[key] as OldT, key, object);
    });
    return result;
}
