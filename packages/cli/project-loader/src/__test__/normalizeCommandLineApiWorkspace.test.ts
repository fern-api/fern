import { describe, expect, it } from "vitest";

import { normalizeCommandLineApiWorkspace } from "../normalizeCommandLineApiWorkspace.js";

describe("normalizeCommandLineApiWorkspace", () => {
    it("returns undefined when no --api is passed", () => {
        expect(normalizeCommandLineApiWorkspace(undefined)).toBeUndefined();
    });

    it("wraps a single --api string in a one-element array (back-compat for single-api callers)", () => {
        expect(normalizeCommandLineApiWorkspace("foo")).toEqual(["foo"]);
    });

    it("treats an empty array the same as undefined (matches yargs when the flag is not passed)", () => {
        expect(normalizeCommandLineApiWorkspace([])).toBeUndefined();
    });

    it("returns a single-element array unchanged", () => {
        expect(normalizeCommandLineApiWorkspace(["foo"])).toEqual(["foo"]);
    });

    it("preserves order and contents when every name is distinct", () => {
        expect(normalizeCommandLineApiWorkspace(["foo", "bar", "baz"])).toEqual(["foo", "bar", "baz"]);
    });

    it("de-duplicates repeated names, keeping the first occurrence's position", () => {
        expect(normalizeCommandLineApiWorkspace(["foo", "bar", "foo", "baz", "bar"])).toEqual(["foo", "bar", "baz"]);
    });

    it("de-duplicates `--api foo --api foo` to a single name", () => {
        expect(normalizeCommandLineApiWorkspace(["foo", "foo"])).toEqual(["foo"]);
    });

    it("preserves user-specified order (not alphabetical)", () => {
        expect(normalizeCommandLineApiWorkspace(["zeta", "alpha", "mu"])).toEqual(["zeta", "alpha", "mu"]);
    });
});
