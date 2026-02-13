/**
 * Sets the value at path of object. If a portion of path doesn’t exist it’s created. This is
 * inspired by Lodash's set function, but is simplified to accommodate our use case.
 * For more details, see https://lodash.com/docs/4.17.15#set.
 *
 * @param object The object to modify.
 * @param path The path of the property to set.
 * @param value The value to set.
 * @return Returns object.
 */
export declare function setObjectProperty<T extends object>(object: T, path: string, value: any): T;
