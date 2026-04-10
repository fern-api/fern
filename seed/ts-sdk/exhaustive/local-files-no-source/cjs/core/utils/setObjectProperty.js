"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setObjectProperty = setObjectProperty;
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
function setObjectProperty(object, path, value) {
    if (object == null) {
        return object;
    }
    const keys = path.split(".");
    if (keys.length === 0) {
        // Invalid path; do nothing.
        return object;
    }
    let current = object;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key == null) {
            // Unreachable.
            continue;
        }
        if (!current[key] || typeof current[key] !== "object") {
            current[key] = {};
        }
        current = current[key];
    }
    const lastKey = keys[keys.length - 1];
    if (lastKey == null) {
        // Unreachable.
        return object;
    }
    current[lastKey] = value;
    return object;
}
