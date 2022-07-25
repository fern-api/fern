import { convertWorkspaceConfiguration } from "../convertWorkspaceConfiguration";

describe("convertWorkspaceConfiguration", () => {
    it("relative input path", () => {
        const result = convertWorkspaceConfiguration({
            workspaceConfiguration: {
                name: "my-definition",
                definition: "my/definition",
                generators: [],
            },
            absolutePathToDefinition: "/path/to/definition/.fernrc.yml",
        });
        expect(result._absolutePath).toBe("/path/to/definition");
        expect(result.absolutePathToConfiguration).toBe("/path/to/definition/my/definition");
    });

    it("absolute input path", () => {
        const result = convertWorkspaceConfiguration({
            workspaceConfiguration: {
                name: "my-definition",
                definition: "/my/definition",
                generators: [],
            },
            absolutePathToDefinition: "/path/to/definition/.fernrc.yml",
        });
        expect(result._absolutePath).toBe("/path/to/definition");
        expect(result.absolutePathToConfiguration).toBe("/my/definition");
    });
});
