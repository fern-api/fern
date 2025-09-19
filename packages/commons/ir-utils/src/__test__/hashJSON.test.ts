import { hashJSON } from "../hashJSON";

describe("hashJSON Function", () => {
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    const generateLargeObject = (depth: number, breadth: number): any => {
        if (depth === 0) {
            return "LARGE_STRING_VALUE";
        }
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        const obj: any = {};
        for (let i = 0; i < breadth; i++) {
            obj[`key_${i}`] = generateLargeObject(depth - 1, breadth);
        }
        return obj;
    };

    it("should hash a reasonably large object without errors", () => {
        const largeObj = generateLargeObject(3, 5);

        expect(() => {
            const hash = hashJSON(largeObj);
            expect(typeof hash).toBe("string");
        }).not.toThrow();
    });

    it("should hash a very large object without errors", () => {
        const largeObj = generateLargeObject(8, 10);

        expect(() => {
            const hash = hashJSON(largeObj);
            expect(typeof hash).toBe("string");
        }).not.toThrow();
    }, 120_000);
});
