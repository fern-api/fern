import { convertToFormUrlEncodedPairs } from "../MockEndpointGenerator.js";

describe("convertToFormUrlEncodedPairs", () => {
    it("escapes JSON strings embedded in form values", () => {
        expect(
            convertToFormUrlEncodedPairs({
                Content: '{"key":"value"}',
                IdempotencyKey: "1"
            })
        ).toBe(String.raw`"Content={\"key\":\"value\"}", "IdempotencyKey=1"`);
    });

    it("escapes special characters across the complete form pair", () => {
        expect(convertToFormUrlEncodedPairs({ 'key"with-quote': "C:\\temp\nfile" })).toBe(
            String.raw`"key\"with-quote=C:\\temp\nfile"`
        );
    });
});
