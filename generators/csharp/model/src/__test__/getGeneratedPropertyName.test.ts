import { CaseConverter } from "@fern-api/base-generator";
import { describe, expect, it } from "vitest";

import { getGeneratedPropertyName } from "../generateFields.js";

describe("getGeneratedPropertyName", () => {
    const caseConverter = new CaseConverter({
        generationLanguage: "csharp",
        keywords: undefined,
        smartCasing: true
    });

    it("PascalCases the wire name", () => {
        expect(getGeneratedPropertyName({ caseConverter, className: "Dog", name: "my_field" })).toBe("MyField");
    });

    it("does not suffix when the property name differs from the enclosing class name", () => {
        expect(getGeneratedPropertyName({ caseConverter, className: "Shape", name: "name" })).toBe("Name");
    });

    it("suffixes with `_` when the property name collides with the enclosing class name (CS0102)", () => {
        // A property whose PascalCase form equals its enclosing class name would be an illegal
        // member/type name clash in C#, so it must be disambiguated with a trailing underscore.
        expect(getGeneratedPropertyName({ caseConverter, className: "Shape", name: "shape" })).toBe("Shape_");
    });
});
