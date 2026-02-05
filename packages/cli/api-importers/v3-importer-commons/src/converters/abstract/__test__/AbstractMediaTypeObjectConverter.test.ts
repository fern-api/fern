import { describe, expect, it, vi } from "vitest";
import { AbstractConverterContext } from "../../../AbstractConverterContext";
import { AbstractMediaTypeObjectConverter } from "../AbstractMediaTypeObjectConverter";

const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
};

const createMockContext = (isExampleWithSummaryFn: (example: unknown) => boolean) =>
    ({
        logger: mockLogger,
        isExampleWithSummary: isExampleWithSummaryFn
    }) as unknown as AbstractConverterContext<object>;

class TestMediaTypeObjectConverter extends AbstractMediaTypeObjectConverter {
    convert(): AbstractMediaTypeObjectConverter.Output | undefined {
        return undefined;
    }

    public testGetIdForExample(args: { key: string; example: unknown; usedExampleNames: Set<string> }): string {
        return (
            this as unknown as {
                getIdForExample: (args: { key: string; example: unknown; usedExampleNames: Set<string> }) => string;
            }
        ).getIdForExample(args);
    }
}

describe("AbstractMediaTypeObjectConverter", () => {
    describe("getIdForExample", () => {
        it("should return the key when example has no summary", () => {
            const mockContext = createMockContext(() => false);
            const converter = new TestMediaTypeObjectConverter({
                context: mockContext,
                breadcrumbs: [],
                group: ["test"],
                method: "get"
            });

            const result = converter.testGetIdForExample({
                key: "example1",
                example: { value: "test" },
                usedExampleNames: new Set()
            });

            expect(result).toBe("example1");
        });

        it("should return the summary when example has summary and no collision", () => {
            const mockContext = createMockContext((example) => {
                return typeof example === "object" && example !== null && "summary" in example;
            });
            const converter = new TestMediaTypeObjectConverter({
                context: mockContext,
                breadcrumbs: [],
                group: ["test"],
                method: "get"
            });

            const result = converter.testGetIdForExample({
                key: "example1",
                example: { summary: "My Example", value: "test" },
                usedExampleNames: new Set()
            });

            expect(result).toBe("My Example");
        });

        it("should return disambiguated name when summary collides", () => {
            const mockContext = createMockContext((example) => {
                return typeof example === "object" && example !== null && "summary" in example;
            });
            const converter = new TestMediaTypeObjectConverter({
                context: mockContext,
                breadcrumbs: [],
                group: ["test"],
                method: "get"
            });

            const usedExampleNames = new Set(["Pine Tree"]);
            const result = converter.testGetIdForExample({
                key: "pine2",
                example: { summary: "Pine Tree", value: "test" },
                usedExampleNames
            });

            expect(result).toBe("Pine Tree (pine2)");
        });

        it("should return key when both summary and disambiguated name collide", () => {
            const mockContext = createMockContext((example) => {
                return typeof example === "object" && example !== null && "summary" in example;
            });
            const converter = new TestMediaTypeObjectConverter({
                context: mockContext,
                breadcrumbs: [],
                group: ["test"],
                method: "get"
            });

            const usedExampleNames = new Set(["Pine Tree", "Pine Tree (pine2)"]);
            const result = converter.testGetIdForExample({
                key: "pine2",
                example: { summary: "Pine Tree", value: "test" },
                usedExampleNames
            });

            expect(result).toBe("pine2");
        });

        it("should handle multiple collisions correctly", () => {
            const mockContext = createMockContext((example) => {
                return typeof example === "object" && example !== null && "summary" in example;
            });
            const converter = new TestMediaTypeObjectConverter({
                context: mockContext,
                breadcrumbs: [],
                group: ["test"],
                method: "get"
            });

            const usedExampleNames = new Set<string>();

            const result1 = converter.testGetIdForExample({
                key: "ex1",
                example: { summary: "Example", value: "test1" },
                usedExampleNames
            });
            usedExampleNames.add(result1);

            const result2 = converter.testGetIdForExample({
                key: "ex2",
                example: { summary: "Example", value: "test2" },
                usedExampleNames
            });
            usedExampleNames.add(result2);

            const result3 = converter.testGetIdForExample({
                key: "ex3",
                example: { summary: "Example", value: "test3" },
                usedExampleNames
            });

            expect(result1).toBe("Example");
            expect(result2).toBe("Example (ex2)");
            expect(result3).toBe("Example (ex3)");
        });
    });
});
