/**
 * Returns a copy of object with the value at path set. If a portion of path doesn’t exist it’s created.
 * Each object along path is shallow-copied, so the original object (and any nested objects it
 * shares with the copy) is never modified. This is inspired by Lodash's set function, but is
 * simplified to accommodate our use case. For more details, see https://lodash.com/docs/4.17.15#set.
 *
 * @param object The object to copy.
 * @param path The path of the property to set.
 * @param value The value to set.
 * @return Returns the updated copy of object.
 */
export declare function setObjectProperty<T extends object>(object: T, path: string, value: any): T;
