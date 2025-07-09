"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBinaryResponse = getBinaryResponse;
function getBinaryResponse(response) {
    return {
        get bodyUsed() {
            return response.bodyUsed;
        },
        stream: () => response.body,
        arrayBuffer: response.arrayBuffer.bind(response),
        blob: response.blob.bind(response),
        bytes: response.bytes.bind(response),
    };
}
