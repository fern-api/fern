import { RelativeFilePath } from "@fern-api/core-utils";
import { WorkspaceConfigurationSchema } from "@fern-api/workspace-configuration";
import { addJavaGenerator, addTypescriptGenerator } from "../addGenerator";

describe("addGenerator", () => {
    it("adds generator if not present", () => {
        const workspaceConfiguration: WorkspaceConfigurationSchema = {
            name: "my-definition",
            definition: RelativeFilePath.of("./src"),
            generators: [],
        };
        const addGeneratorResult = addJavaGenerator(workspaceConfiguration);
        expect(addGeneratorResult).toBeDefined();
        expect(addGeneratorResult?.updatedGeneratorsConfiguration.generators.length).toEqual(1);
    });

    it("skip if present", () => {
        const workspaceConfiguration: WorkspaceConfigurationSchema = {
            name: "my-definition",
            definition: RelativeFilePath.of("./src"),
            generators: [
                {
                    name: "fernapi/fern-typescript",
                    version: "0.0.23",
                },
            ],
        };
        const addGeneratorResult = addTypescriptGenerator(workspaceConfiguration);
        expect(addGeneratorResult).toEqual(undefined);
    });
});
