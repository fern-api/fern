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
export function setObjectProperty(object, path, value) {
    if (object == null) {
        return object;
    }
    const keys = path.split(".");
    if (keys.length === 0) {
        // Invalid path; do nothing.
        return object;
    }
    const result = Object.assign({}, object);
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key == null) {
            // Unreachable.
            continue;
        }
        const next = current[key];
        if (Array.isArray(next)) {
            current[key] = [...next];
        }
        else {
            current[key] = next != null && typeof next === "object" ? Object.assign({}, next) : {};
        }
        current = current[key];
    }
    const lastKey = keys[keys.length - 1];
    if (lastKey == null) {
        // Unreachable.
        return result;
    }
    current[lastKey] = value;
    return result;
}
