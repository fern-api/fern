import { describe, expect, it } from "vitest";
import { Writer } from "../core/Writer.js";
import { Type } from "../Type.js";

function writeDate(customConfig: Record<string, unknown>): Writer {
    const writer = new Writer({ packageName: "com.example", customConfig: customConfig as never });
    Type.date().write(writer);
    return writer;
}

describe("Type.date", () => {
    it("writes String by default", () => {
        expect(writeDate({}).toString()).toBe("String");
    });

    it("writes LocalDate when use-local-date-for-dates is enabled", () => {
        const writer = writeDate({ "use-local-date-for-dates": true });
        expect(writer.toString()).toBe("LocalDate");
        expect([...writer.getImports()]).toContain("java.time.LocalDate");
    });
});
