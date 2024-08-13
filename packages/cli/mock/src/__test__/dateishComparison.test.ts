import { isEqualWith } from "lodash-es";
import { dateishCustomizer } from "../runMockServer";

describe("Test dateishCustomizer", () => {
    it("should directly compare primitives", () => {
        expect(isEqualWith(1, 2, dateishCustomizer)).toBe(false);
        expect(isEqualWith(1, 1, dateishCustomizer)).toBe(true);

        expect(isEqualWith("1", "2", dateishCustomizer)).toBe(false);
        expect(isEqualWith("1", "1", dateishCustomizer)).toBe(true);

        expect(isEqualWith(true, false, dateishCustomizer)).toBe(false);
        expect(isEqualWith(true, true, dateishCustomizer)).toBe(true);
    });

    it("should loosely compare dates", () => {
        expect(isEqualWith("2024-07-19T00:29:35.178000Z", "2024-07-19T00:29:35.178992", dateishCustomizer)).toBe(true);
        expect(isEqualWith("2024-07-19T00:29:35.178000Z", "2024-07-19T00:29:35.178000Z", dateishCustomizer)).toBe(true);
        expect(isEqualWith("2024-07-19T00:29:35.178000Z", "2024-07-19", dateishCustomizer)).toBe(true);

        // Too big a gap
        expect(isEqualWith("2024-07-19T00:29:35.178000Z", "2024-07-20T00:29:35.178000Z", dateishCustomizer)).toBe(
            false
        );
    });

    it("should deeply compare objects", () => {
        const obj1 = {
            a: 1,
            b: "2",
            c: "2024-07-19T00:29:35.178000Z"
        };
        const obj2 = {
            a: 1,
            b: "2",
            c: "2024-07-19T00:29:35.178992"
        };
        expect(isEqualWith(obj1, obj2, dateishCustomizer)).toBe(true);

        const obj3 = {
            a: 1,
            b: "2",
            c: "2024-07-19T00:29:35.178000Z"
        };
        const obj4 = {
            a: 2,
            b: "2",
            c: "2024-07-19T00:29:35.178000Z"
        };
        expect(isEqualWith(obj3, obj4, dateishCustomizer)).toBe(false);
    });
});
