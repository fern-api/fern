import { describe, expect, it } from "vitest";
import { withReferenceOptional } from "../withReferenceOptional.js";

const SERIALIZED_CONFIG = { irFilepath: "/ir.json", workspaceName: "workspace" };

describe("withReferenceOptional", () => {
    it("adds referenceOptional to the generator config when the flag is passed", () => {
        expect(withReferenceOptional(SERIALIZED_CONFIG, true)).toEqual({
            ...SERIALIZED_CONFIG,
            referenceOptional: true
        });
    });

    it("leaves the generator config untouched when the flag is not passed", () => {
        expect(withReferenceOptional(SERIALIZED_CONFIG, false)).toEqual(SERIALIZED_CONFIG);
        expect(withReferenceOptional(SERIALIZED_CONFIG, undefined)).toEqual(SERIALIZED_CONFIG);
    });
});
