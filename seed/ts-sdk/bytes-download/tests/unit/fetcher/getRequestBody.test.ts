import { getRequestBody } from "../../../src/core/fetcher/getRequestBody";
import { RUNTIME } from "../../../src/core/runtime";

describe("Test getRequestBody", () => {
    it("should stringify body if not FormData in Node environment", async () => {
        if (RUNTIME.type === "node") {
            const body = { key: "value" };
            const result = await getRequestBody({
                body,
                type: "json",
            });
            expect(result).toBe('{"key":"value"}');
        }
    });

    it("should return FormData in browser environment", async () => {
        if (RUNTIME.type === "browser") {
            const formData = new FormData();
            formData.append("key", "value");
            const result = await getRequestBody({
                body: formData,
                type: "file",
            });
            expect(result).toBe(formData);
        }
    });

    it("should stringify body if not FormData in browser environment", async () => {
        if (RUNTIME.type === "browser") {
            const body = { key: "value" };
            const result = await getRequestBody({
                body,
                type: "json",
            });
            expect(result).toBe('{"key":"value"}');
        }
    });

    it("should return the Uint8Array", async () => {
        const input = new Uint8Array([1, 2, 3]);
        const result = await getRequestBody({
            body: input,
            type: "bytes",
        });
        expect(result).toBe(input);
    });

    it("should serialize objects for form-urlencoded content type", async () => {
        const input = { username: "johndoe", email: "john@example.com" };
        const result = await getRequestBody({
            body: input,
            type: "form",
        });
        expect(result).toBe("username=johndoe&email=john%40example.com");
    });

    it("should serialize complex nested objects and arrays for form-urlencoded content type", async () => {
        const input = {
            user: {
                profile: {
                    name: "John Doe",
                    settings: {
                        theme: "dark",
                        notifications: true,
                    },
                },
                tags: ["admin", "user"],
                contacts: [
                    { type: "email", value: "john@example.com" },
                    { type: "phone", value: "+1234567890" },
                ],
            },
            filters: {
                status: ["active", "pending"],
                metadata: {
                    created: "2024-01-01",
                    categories: ["electronics", "books"],
                },
            },
            preferences: ["notifications", "updates"],
        };
        const result = await getRequestBody({
            body: input,
            type: "form",
        });
        expect(result).toBe(
            "user%5Bprofile%5D%5Bname%5D=John%20Doe&" +
                "user%5Bprofile%5D%5Bsettings%5D%5Btheme%5D=dark&" +
                "user%5Bprofile%5D%5Bsettings%5D%5Bnotifications%5D=true&" +
                "user%5Btags%5D=admin&" +
                "user%5Btags%5D=user&" +
                "user%5Bcontacts%5D%5Btype%5D=email&" +
                "user%5Bcontacts%5D%5Bvalue%5D=john%40example.com&" +
                "user%5Bcontacts%5D%5Btype%5D=phone&" +
                "user%5Bcontacts%5D%5Bvalue%5D=%2B1234567890&" +
                "filters%5Bstatus%5D=active&" +
                "filters%5Bstatus%5D=pending&" +
                "filters%5Bmetadata%5D%5Bcreated%5D=2024-01-01&" +
                "filters%5Bmetadata%5D%5Bcategories%5D=electronics&" +
                "filters%5Bmetadata%5D%5Bcategories%5D=books&" +
                "preferences=notifications&" +
                "preferences=updates",
        );
    });

    it("should return the input for pre-serialized form-urlencoded strings", async () => {
        const input = "key=value&another=param";
        const result = await getRequestBody({
            body: input,
            type: "other",
        });
        expect(result).toBe(input);
    });

    it("should JSON stringify objects", async () => {
        const input = { key: "value" };
        const result = await getRequestBody({
            body: input,
            type: "json",
        });
        expect(result).toBe('{"key":"value"}');
    });
});
