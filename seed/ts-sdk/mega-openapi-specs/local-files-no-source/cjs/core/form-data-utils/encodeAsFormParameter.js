"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeAsFormParameter = encodeAsFormParameter;
const qs_js_1 = require("../url/qs.js");
function encodeAsFormParameter(value) {
    const stringified = (0, qs_js_1.toQueryString)(value, { encode: false });
    const keyValuePairs = stringified.split("&").map((pair) => {
        const [key, value] = pair.split("=");
        return [key, value];
    });
    return Object.fromEntries(keyValuePairs);
}
