import { beforeAll, describe, expect, it } from "vitest";
import { type Bump, diffGeneratorVersions, mergeDiffResults } from "../commands/diff/diff";
import { MockCliContext } from "./mockCliContext";

describe("mergeDiffResults tests", () => {
    let context: MockCliContext;

    beforeAll(() => {
        context = new MockCliContext();
    });

    it.each([
        { bumpA: undefined, bumpB: undefined, expected: undefined },
        { bumpA: undefined, bumpB: "major", expected: "major" },
        { bumpA: "major", bumpB: undefined, expected: "major" },
        { bumpA: "minor", bumpB: undefined, expected: "minor" },
        { bumpA: "patch", bumpB: undefined, expected: "patch" },
        { bumpA: undefined, bumpB: "minor", expected: "minor" },
        { bumpA: undefined, bumpB: "patch", expected: "patch" },
        { bumpA: "major", bumpB: "major", expected: "major" },
        { bumpA: "major", bumpB: "minor", expected: "major" },
        { bumpA: "major", bumpB: "patch", expected: "major" },
        { bumpA: "minor", bumpB: "major", expected: "major" },
        { bumpA: "minor", bumpB: "minor", expected: "minor" },
        { bumpA: "minor", bumpB: "patch", expected: "minor" },
        { bumpA: "patch", bumpB: "major", expected: "major" },
        { bumpA: "patch", bumpB: "minor", expected: "minor" },
        { bumpA: "patch", bumpB: "patch", expected: "patch" }
    ])("mergeDiffResults $bumpA to $bumpB -> $expected", ({ bumpA, bumpB, expected }) => {
        const result = mergeDiffResults({ bump: bumpA as Bump, errors: [] }, { bump: bumpB as Bump, errors: [] });
        expect(result.bump).toBe(expected);
    });

    it.each([
        { aErrors: [], bErrors: [], expectedErrors: [] },
        { aErrors: ["foo", "bar"], bErrors: [], expectedErrors: ["foo", "bar"] },
        { aErrors: [], bErrors: ["baz", "qux"], expectedErrors: ["baz", "qux"] },
        { aErrors: ["foo", "bar"], bErrors: ["baz", "qux"], expectedErrors: ["foo", "bar", "baz", "qux"] }
    ])("mergeDiffResults $aErrors to $bErrors -> $expectedErrors", ({ aErrors, bErrors, expectedErrors }) => {
        const bumps = ["major", "minor", "patch"];
        for (const aBump of bumps) {
            for (const bBump of bumps) {
                const result = mergeDiffResults(
                    { bump: aBump as Bump, errors: aErrors },
                    { bump: bBump as Bump, errors: bErrors }
                );
                expect(result.errors.toSorted()).toEqual(expectedErrors.toSorted());
            }
        }
    });

    it.each([
        { from: "1.0.0", to: "1.0.0", expected: undefined },
        { from: "1.0.0", to: "1.0.1", expected: "patch" },
        { from: "1.0.0", to: "1.0.2", expected: "patch" },
        { from: "1.0.0", to: "1.1.0", expected: "minor" },
        { from: "1.0.0", to: "1.2.0", expected: "minor" },
        { from: "1.0.0", to: "1.2.1", expected: "minor" },
        { from: "1.0.0", to: "2.0.0", expected: "major" },
        { from: "1.0.0", to: "2.0.1", expected: "major" },
        { from: "1.0.0", to: "2.0.1", expected: "major" },
        { from: "1.0.0", to: "2.1.0", expected: "major" },
        { from: "1.0.0", to: "2.1.1", expected: "major" },
        { from: "1.0.0", to: "3.0.0", expected: "major" }
    ])("diffGeneratorVersions $from to $to -> $expected", ({ from, to, expected }) => {
        const result = diffGeneratorVersions(context, { from, to });
        expect(result.bump).toBe(expected);
    });

    it.each([
        { from: "1.0.0", to: "0.0.0" },
        { from: "1.0.0", to: "0.1.0" },
        { from: "1.0.0", to: "0.0.1" },
        { from: "2.0.0", to: "1.0.0" },
        { from: "1.0.0", to: "abcde" },
        { from: "abcde", to: "1.0.0" }
    ])("diffGeneratorVersions $from to $to -> throws", ({ from, to }) => {
        expect(() => diffGeneratorVersions(context, { from, to })).toThrow();
    });
});
