export async function toReadableStream(encoder: import("form-data-encoder").FormDataEncoder) {
    const iterator = encoder.encode();

    return new ReadableStream({
        async pull(controller) {
            const { value, done } = await iterator.next();

            if (done) {
                return controller.close();
            }

            controller.enqueue(value);
        },
    });
}
