import { convertWorkspaceDefinition } from "../convertWorkspaceDefinition";

describe("convertWorkspaceDefinition", () => {
    it("relative input path", () => {
        const result = convertWorkspaceDefinition({
            workspaceDefinition: {
                name: "my-definition",
                definition: "my/definition",
                generators: [],
            },
            absolutePathToDefinition: "/path/to/definition/.fernrc.yml",
        });
        expect(result._absolutePath).toBe("/path/to/definition");
        expect(result.absolutePathToDefinition).toBe("/path/to/definition/my/definition");
    });

    it("absolute input path", () => {
        const result = convertWorkspaceDefinition({
            workspaceDefinition: {
                name: "my-definition",
                definition: "/my/definition",
                generators: [],
            },
            absolutePathToDefinition: "/path/to/definition/.fernrc.yml",
        });
        expect(result._absolutePath).toBe("/path/to/definition");
        expect(result.absolutePathToDefinition).toBe("/my/definition");
    });
});
