import { RelativeFilePath } from "@fern-api/core-utils";
import { convertWorkspaceConfiguration } from "../convertWorkspaceConfiguration";

describe("convertWorkspaceConfiguration", () => {
    it("relative input path", () => {
        const result = convertWorkspaceConfiguration({
            workspaceConfiguration: {
                name: "my-definition",
                definition: RelativeFilePath.of("my/definition"),
                generators: [],
            },
            absolutePathToConfiguration: "/path/to/definition/.fernrc.yml",
        });
        expect(result._absolutePath).toBe("/path/to/definition");
        expect(result.absolutePathToDefinition).toBe("/path/to/definition/my/definition");
    });

    it("absolute input path", () => {
        const result = convertWorkspaceConfiguration({
            workspaceConfiguration: {
                name: "my-definition",
                definition: "/my/definition",
                generators: [],
            },
            absolutePathToConfiguration: "/path/to/definition/.fernrc.yml",
        });
        expect(result._absolutePath).toBe("/path/to/definition");
        expect(result.absolutePathToDefinition).toBe("/my/definition");
    });
});
