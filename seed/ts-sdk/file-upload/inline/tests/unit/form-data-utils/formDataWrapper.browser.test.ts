import { FormDataWrapper, newFormData } from "../../../src/core/form-data-utils/FormDataWrapper";

type FormDataRequest = ReturnType<InstanceType<typeof FormDataWrapper>["getRequest"]>;

async function getFormDataInfo(formRequest: FormDataRequest): Promise<{
    hasFile: boolean;
    filename?: string;
    contentType?: string;
    serialized: string;
}> {
    const request = new Request("http://localhost", {
        ...formRequest,
        method: "POST",
    });
    const buffer = await request.arrayBuffer();
    const serialized = new TextDecoder().decode(buffer);

    const filenameMatch = serialized.match(/filename="([^"]+)"/);
    const filename = filenameMatch ? filenameMatch[1] : undefined;

    const contentTypeMatch = serialized.match(/Content-Type: ([^\r\n]+)/);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : undefined;

    return {
        hasFile: !!filename,
        filename,
        contentType,
        serialized,
    };
}

describe("FormDataWrapper - Browser Environment", () => {
    let formData: FormDataWrapper;

    beforeEach(async () => {
        formData = new FormDataWrapper();
        await formData.setup();
    });

    describe("Web ReadableStream", () => {
        it("serializes Web ReadableStream with filename", async () => {
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode("web stream content"));
                    controller.close();
                },
            });

            await formData.appendFile("file", stream, "webstream.txt");

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file"');
            expect(serialized).toContain('filename="webstream.txt"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("webstream.txt");
        });

        it("handles empty Web ReadableStream", async () => {
            const stream = new ReadableStream({
                start(controller) {
                    controller.close();
                },
            });

            await formData.appendFile("file", stream, "empty.txt");

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file"');
            expect(serialized).toContain('filename="empty.txt"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("empty.txt");
        });
    });

    describe("Browser-specific types", () => {
        it("serializes Blob with specified filename and content type", async () => {
            const blob = new Blob(["file content"], { type: "text/plain" });
            await formData.appendFile("file", blob, "testfile.txt");

            const { serialized, hasFile, contentType, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file"');
            expect(serialized).toContain('filename="testfile.txt"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("testfile.txt");
            expect(contentType).toBe("text/plain");
        });

        it("serializes File and preserves filename", async () => {
            const file = new File(["file content"], "testfile.txt", { type: "text/plain" });
            await formData.appendFile("file", file);

            const { serialized, hasFile, contentType, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file"');
            expect(serialized).toContain('filename="testfile.txt"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("testfile.txt");
            expect(contentType).toBe("text/plain");
        });

        it("allows filename override for File objects", async () => {
            const file = new File(["file content"], "original.txt", { type: "text/plain" });
            await formData.appendFile("file", file, "override.txt");

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file"');
            expect(serialized).toContain('filename="override.txt"');
            expect(serialized).not.toContain('filename="original.txt"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("override.txt");
        });
    });

    describe("Binary data types", () => {
        it("serializes ArrayBuffer with filename", async () => {
            const arrayBuffer = new ArrayBuffer(8);
            new Uint8Array(arrayBuffer).set([1, 2, 3, 4, 5, 6, 7, 8]);

            await formData.appendFile("file", arrayBuffer, "binary.bin");

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file"');
            expect(serialized).toContain('filename="binary.bin"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("binary.bin");
        });

        it("serializes Uint8Array with filename", async () => {
            const uint8Array = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
            await formData.appendFile("file", uint8Array, "binary.bin");

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file"');
            expect(serialized).toContain('filename="binary.bin"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("binary.bin");
        });

        it("serializes other typed arrays", async () => {
            const int16Array = new Int16Array([1000, 2000, 3000]);
            await formData.appendFile("file", int16Array, "numbers.bin");

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file"');
            expect(serialized).toContain('filename="numbers.bin"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("numbers.bin");
        });
    });

    describe("Text and primitive types", () => {
        it("serializes string as regular form field", async () => {
            formData.append("text", "test string");

            const { serialized, hasFile } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="text"');
            expect(serialized).not.toContain("filename=");
            expect(serialized).toContain("test string");
            expect(hasFile).toBe(false);
        });

        it("serializes string as file with filename", async () => {
            await formData.appendFile("file", "test content", "text.txt");

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file"');
            expect(serialized).toContain('filename="text.txt"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("text.txt");
        });

        it("serializes numbers and booleans as strings", async () => {
            formData.append("number", 12345);
            formData.append("flag", true);

            const { serialized } = await getFormDataInfo(formData.getRequest());
            expect(serialized).toContain("12345");
            expect(serialized).toContain("true");
        });
    });

    describe("Object and JSON handling", () => {
        it("serializes objects as JSON with filename", async () => {
            const obj = { test: "value", nested: { key: "data" } };
            await formData.appendFile("data", obj, "data.json");

            const { serialized, hasFile, contentType, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="data"');
            expect(serialized).toContain('filename="data.json"');
            expect(serialized).toContain("Content-Type: application/json");
            expect(hasFile).toBe(true);
            expect(filename).toBe("data.json");
            expect(contentType).toBe("application/json");
        });

        it("serializes arrays as JSON", async () => {
            const arr = [1, 2, 3, "test"];
            await formData.appendFile("array", arr, "array.json");

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="array"');
            expect(serialized).toContain('filename="array.json"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("array.json");
        });

        it("handles null and undefined values", async () => {
            formData.append("nullValue", null);
            formData.append("undefinedValue", undefined);

            const { serialized } = await getFormDataInfo(formData.getRequest());
            expect(serialized).toContain("null");
            expect(serialized).toContain("undefined");
        });
    });

    describe("Filename extraction from objects", () => {
        it("extracts filename from object with name property", async () => {
            const namedValue = { name: "custom-name.txt", data: "content" };
            await formData.appendFile("file", namedValue);

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file"');
            expect(serialized).toContain('filename="custom-name.txt"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("custom-name.txt");
        });

        it("extracts filename from object with path property", async () => {
            const pathedValue = { path: "/some/path/file.txt", content: "data" };
            await formData.appendFile("file", pathedValue);

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file"');
            expect(serialized).toContain('filename="file.txt"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("file.txt");
        });

        it("prioritizes explicit filename over object properties", async () => {
            const namedValue = { name: "original.txt", data: "content" };
            await formData.appendFile("file", namedValue, "override.txt");

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file"');
            expect(serialized).toContain('filename="override.txt"');
            expect(serialized).not.toContain('filename="original.txt"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("override.txt");
        });
    });

    describe("Edge cases and error handling", () => {
        it("handles empty filename gracefully", async () => {
            await formData.appendFile("file", "content", "");

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('Content-Disposition: form-data; name="file"');
            expect(serialized).toContain('filename="blob"'); // Default fallback
            expect(hasFile).toBe(true);
            expect(filename).toBe("blob");
        });

        it("handles large strings", async () => {
            const largeString = "x".repeat(1000);
            await formData.appendFile("large", largeString, "large.txt");

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="large"');
            expect(serialized).toContain('filename="large.txt"');
            expect(hasFile).toBe(true);
            expect(filename).toBe("large.txt");
        });

        it("handles unicode content and filenames", async () => {
            const unicodeContent = "Hello 世界 🌍 Emoji 🚀";
            const unicodeFilename = "файл-тест-🌟.txt";

            await formData.appendFile("unicode", unicodeContent, unicodeFilename);

            const { serialized, hasFile, filename } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="unicode"');
            expect(serialized).toContain(`filename="${unicodeFilename}"`);
            expect(hasFile).toBe(true);
            expect(filename).toBe(unicodeFilename);
        });

        it("handles multiple files in single form", async () => {
            await formData.appendFile("file1", "content1", "file1.txt");
            await formData.appendFile("file2", "content2", "file2.txt");
            formData.append("text", "regular field");

            const { serialized } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toContain('name="file1"');
            expect(serialized).toContain('filename="file1.txt"');

            expect(serialized).toContain('name="file2"');
            expect(serialized).toContain('filename="file2.txt"');

            expect(serialized).toContain('name="text"');
            expect(serialized).not.toContain('filename="text"');
            expect(serialized).toContain("regular field");
        });
    });

    describe("Request structure", () => {
        it("returns correct request structure", async () => {
            await formData.appendFile("file", "content", "test.txt");

            const request = formData.getRequest();

            expect(request).toHaveProperty("body");
            expect(request).toHaveProperty("headers");
            expect(request).toHaveProperty("duplex");
            expect(request.body).toBeInstanceOf(FormData);
            expect(request.headers).toEqual({});
            expect(request.duplex).toBe("half");
        });

        it("generates proper multipart boundary structure", async () => {
            await formData.appendFile("file", "test content", "test.txt");
            formData.append("field", "value");

            const { serialized } = await getFormDataInfo(formData.getRequest());

            expect(serialized).toMatch(/------formdata-undici-\w+|------WebKitFormBoundary\w+/);
            expect(serialized).toContain("Content-Disposition: form-data;");
            expect(serialized).toMatch(/------formdata-undici-\w+--|------WebKitFormBoundary\w+--/);
        });
    });

    describe("Factory function", () => {
        it("returns FormDataWrapper instance", async () => {
            const formData = await newFormData();
            expect(formData).toBeInstanceOf(FormDataWrapper);
        });

        it("creates independent instances", async () => {
            const formData1 = await newFormData();
            const formData2 = await newFormData();

            await formData1.setup();
            await formData2.setup();

            formData1.append("test1", "value1");
            formData2.append("test2", "value2");

            const request1 = formData1.getRequest() as { body: FormData };
            const request2 = formData2.getRequest() as { body: FormData };

            const entries1 = Array.from(request1.body.entries());
            const entries2 = Array.from(request2.body.entries());

            expect(entries1).toHaveLength(1);
            expect(entries2).toHaveLength(1);
            expect(entries1[0][0]).toBe("test1");
            expect(entries2[0][0]).toBe("test2");
        });
    });
});
