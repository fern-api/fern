"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64Encode = base64Encode;
exports.base64Decode = base64Decode;
function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
}
function bytesToBase64(bytes) {
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
}
function base64Encode(input) {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(input, "utf8").toString("base64");
    }
    const bytes = new TextEncoder().encode(input);
    return bytesToBase64(bytes);
}
function base64Decode(input) {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(input, "base64").toString("utf8");
    }
    const bytes = base64ToBytes(input);
    return new TextDecoder().decode(bytes);
}
