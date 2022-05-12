import { WorkspaceDefinitionSchema } from "@fern-api/compiler-commons";
import { addJavaPlugin, addTypescriptPlugin } from "../addPlugin";

describe("addPlugin", () => {
    it("adds plugin if not present", () => {
        const workspaceDefinition: WorkspaceDefinitionSchema = {
            input: "./src",
            plugins: [],
        };
        const updatedWorkspaceDefinition = addJavaPlugin(workspaceDefinition);
        expect(updatedWorkspaceDefinition.plugins.length).toEqual(1);
    });
    it("skip plugin if present", () => {
        const workspaceDefinition: WorkspaceDefinitionSchema = {
            input: "./src",
            plugins: [
                {
                    name: "fernapi/fern-typescript",
                    version: "0.0.23",
                },
            ],
        };
        const updatedWorkspaceDefinition = addTypescriptPlugin(workspaceDefinition);
        expect(updatedWorkspaceDefinition).toEqual(workspaceDefinition);
    });
});
