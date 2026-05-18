"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthProvider = isAuthProvider;
function isAuthProvider(value) {
    return (typeof value === "object" &&
        value !== null &&
        "getAuthRequest" in value &&
        typeof value.getAuthRequest === "function");
}
