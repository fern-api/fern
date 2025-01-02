import { hashJSON } from "@fern-api/ir-generator";

describe("hashJSON Function", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generateLargeObject = (depth: number, breadth: number): any => {
        if (depth === 0) {
            return "LARGE_STRING_VALUE";
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    });
});
