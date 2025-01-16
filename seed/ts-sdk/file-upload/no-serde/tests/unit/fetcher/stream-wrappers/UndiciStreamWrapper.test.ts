import { UndiciStreamWrapper } from "../../../../src/core/fetcher/stream-wrappers/UndiciStreamWrapper";

describe("UndiciStreamWrapper", () => {
    it("should set encoding to utf-8", async () => {
        const rawStream = new ReadableStream();
        const stream = new UndiciStreamWrapper(rawStream);
        const setEncodingSpy = jest.spyOn(stream, "setEncoding");

        stream.setEncoding("utf-8");

        expect(setEncodingSpy).toHaveBeenCalledWith("utf-8");
    });

    it("should register an event listener for readable", async () => {
        const rawStream = new ReadableStream();
        const stream = new UndiciStreamWrapper(rawStream);
        const onSpy = jest.spyOn(stream, "on");

        stream.on("readable", () => {});

        expect(onSpy).toHaveBeenCalledWith("readable", expect.any(Function));
    });

    it("should remove an event listener for data", async () => {
        const rawStream = new ReadableStream();
        const stream = new UndiciStreamWrapper(rawStream);
        const offSpy = jest.spyOn(stream, "off");

        const fn = () => {};
        stream.on("data", fn);
        stream.off("data", fn);

        expect(offSpy).toHaveBeenCalledWith("data", expect.any(Function));
    });

    it("should write to dest when calling pipe to writable stream", async () => {
        const rawStream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode("test"));
                controller.enqueue(new TextEncoder().encode("test"));
                controller.close();
            },
        });
        const stream = new UndiciStreamWrapper(rawStream);
        const dest = new WritableStream({
            write(chunk) {
                expect(chunk).toEqual(new TextEncoder().encode("test"));
            },
        });

        stream.pipe(dest);
    });

    it("should write nothing when calling pipe and unpipe", async () => {
        const rawStream = new ReadableStream();
        const stream = new UndiciStreamWrapper(rawStream);
        const buffer: Uint8Array[] = [];
        const dest = new WritableStream({
            write(chunk) {
                buffer.push(chunk);
            },
        });
        stream.pipe(dest);
        stream.unpipe(dest);

        expect(buffer).toEqual([]);
    });

    it("should destroy the stream", async () => {
        const rawStream = new ReadableStream();
        const stream = new UndiciStreamWrapper(rawStream);
        const destroySpy = jest.spyOn(stream, "destroy");

        stream.destroy();

        expect(destroySpy).toHaveBeenCalled();
    });

    it("should pause and resume the stream", async () => {
        const rawStream = new ReadableStream();
        const stream = new UndiciStreamWrapper(rawStream);
        const pauseSpy = jest.spyOn(stream, "pause");
        const resumeSpy = jest.spyOn(stream, "resume");

        expect(stream.isPaused).toBe(false);
        stream.pause();
        expect(stream.isPaused).toBe(true);
        stream.resume();

        expect(pauseSpy).toHaveBeenCalled();
        expect(resumeSpy).toHaveBeenCalled();
    });

    it("should read the stream", async () => {
        const rawStream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode("test"));
                controller.enqueue(new TextEncoder().encode("test"));
                controller.close();
            },
        });
        const stream = new UndiciStreamWrapper(rawStream);

        expect(await stream.read()).toEqual(new TextEncoder().encode("test"));
        expect(await stream.read()).toEqual(new TextEncoder().encode("test"));
    });

    it("should read the stream as text", async () => {
        const rawStream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode("test"));
                controller.enqueue(new TextEncoder().encode("test"));
                controller.close();
            },
        });
        const stream = new UndiciStreamWrapper(rawStream);

        const data = await stream.text();

        expect(data).toEqual("testtest");
    });

    it("should read the stream as json", async () => {
        const rawStream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode(JSON.stringify({ test: "test" })));
                controller.close();
            },
        });
        const stream = new UndiciStreamWrapper(rawStream);

        const data = await stream.json();

        expect(data).toEqual({ test: "test" });
    });

    it("should allow use with async iteratable stream", async () => {
        const rawStream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode("test"));
                controller.enqueue(new TextEncoder().encode("test"));
                controller.close();
            },
        });
        let data = "";
        const stream = new UndiciStreamWrapper(rawStream);
        for await (const chunk of stream) {
            data += new TextDecoder().decode(chunk);
        }

        expect(data).toEqual("testtest");
    });
});
