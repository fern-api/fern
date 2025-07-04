export function getBinaryResponse(response) {
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
