import { convertWorkspaceDefinition } from "../convertWorkspaceDefinition";

describe("convertWorkspaceDefinition", () => {
    it("relative input path", () => {
        const result = convertWorkspaceDefinition({
            definition: {
                input: "my/input",
                plugins: [],
            },
            absolutePathToDefinition: "/path/to/definition/.fernrc.yml",
        });
        expect(result._absolutePath).toBe("/path/to/definition");
        expect(result.absolutePathToInput).toBe("/path/to/definition/my/input");
    });

    it("absolute input path", () => {
        const result = convertWorkspaceDefinition({
            definition: {
                input: "/my/input",
                plugins: [],
            },
            absolutePathToDefinition: "/path/to/definition/.fernrc.yml",
        });
        expect(result._absolutePath).toBe("/path/to/definition");
        expect(result.absolutePathToInput).toBe("/my/input");
    });
});
