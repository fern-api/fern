import { describe, expect, it } from "vitest";

import { booleanHeaderValue } from "../utils/booleanHeaderValue.js";

describe("booleanHeaderValue", () => {
    it("spells a boolean out instead of relying on php's string cast", () => {
        expect(booleanHeaderValue({ reference: "$request->flag" })).toBe("$request->flag ? 'true' : 'false'");
    });

    it("applies a client default before spelling, so an explicit false is not cast to an empty string", () => {
        expect(booleanHeaderValue({ reference: "$request->flag", clientDefault: true })).toBe(
            "($request->flag ?? true) ? 'true' : 'false'"
        );
        expect(booleanHeaderValue({ reference: "$request->flag", clientDefault: false })).toBe(
            "($request->flag ?? false) ? 'true' : 'false'"
        );
    });

    it("passes a wire string from a client default or environment variable through unchanged", () => {
        // `$flag ??= 'false'` or `getenv(...)` leave a string, and 'false' is truthy in php
        expect(booleanHeaderValue({ reference: "$flag", mayBeString: true })).toBe(
            "is_string($flag) ? $flag : ($flag ? 'true' : 'false')"
        );
    });
});
