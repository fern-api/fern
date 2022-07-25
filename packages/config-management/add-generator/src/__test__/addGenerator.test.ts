import { WorkspaceConfigurationSchema } from "@fern-api/workspace-configuration";
import { addJavaGenerator, addTypescriptGenerator } from "../addGenerator";

describe("addGenerator", () => {
    it("adds generator if not present", () => {
        const workspaceConfiguration: WorkspaceConfigurationSchema = {
            name: "my-definition",
            definition: "./src",
            generators: [],
        };
        const updatedWorkspaceConfiguration = addJavaGenerator(workspaceConfiguration);
        expect(updatedWorkspaceConfiguration.generators.length).toEqual(1);
    });

    it("skip if present", () => {
        const workspaceConfiguration: WorkspaceConfigurationSchema = {
            name: "my-definition",
            definition: "./src",
            generators: [
                {
                    name: "fernapi/fern-typescript",
                    version: "0.0.23",
                },
            ],
        };
        const updatedWorkspaceConfiguration = addTypescriptGenerator(workspaceConfiguration);
        expect(updatedWorkspaceConfiguration).toEqual(workspaceConfiguration);
    });
});
