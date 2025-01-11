import { createPythonClassName } from "../../core/utils";

describe("Casing", () => {
    describe("createPythonClassName", () => {
        const testCases: [string, string][] = [
            // Basic cases
            ["hello world", "HelloWorld"],
            ["simpleTestCase", "SimpleTestCase"],
            // Special characters
            ["hello-world", "HelloWorld"],
            ["$special#characters%", "SpecialCharacters"],
            // Numbers
            ["123 invalid class name", "Class123InvalidClassName"],
            ["mixed 123 cases", "Mixed123Cases"],
            // Underscores
            ["_leading_underscores_", "LeadingUnderscores"],
            ["trailing_underscores_", "TrailingUnderscores"],
            ["_123numbers_starting", "Class123NumbersStarting"],
            // Empty and invalid input
            ["", "Class"],
            ["123", "Class123"],
            ["_123_", "Class123"],
            // Complex cases
            ["complex mix_of-DifferentCases", "ComplexMixOfDifferentCases"],
            ["ALLCAPS input", "ALLCAPSInput"], // Preserve ALLCAPS as requested
            ["PascalCaseAlready", "PascalCaseAlready"]
        ];

        it.each<[string, string]>(testCases)("should convert %s' to %s'", (input, expected) => {
            expect(createPythonClassName(input)).toBe(expected);
        });
    });
});
