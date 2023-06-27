// https://github.com/lodash/lodash/blob/master/isPlainObject.js
export function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (!isObjectLike(value) || toString.call(value) !== "[object Object]") {
        return false;
    }
    if (Object.getPrototypeOf(value) == null) {
        return true;
    }
    let proto = value;
    while (Object.getPrototypeOf(proto) != null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(value) === proto;
}

function isObjectLike(value: unknown) {
    return typeof value === "object" && value != null;
}
