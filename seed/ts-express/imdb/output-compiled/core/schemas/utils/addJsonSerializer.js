"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addJsonSerializer = addJsonSerializer;
function addJsonSerializer(obj, toJsonFn) {
    Object.defineProperty(obj, "toJSON", {
        value: toJsonFn,
        enumerable: false,
        writable: true,
        configurable: true,
    });
    return obj;
}
