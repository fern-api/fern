import { GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { addJavaGenerator, addTypescriptGenerator } from "../addGenerator";

describe("addGenerator", () => {
    it("adds generator if not present", () => {
        const generatorsConfiguration: GeneratorsConfigurationSchema = {
            generators: [],
        };
        const addGeneratorResult = addJavaGenerator(generatorsConfiguration);
        expect(addGeneratorResult).toBeDefined();
        expect(addGeneratorResult?.updatedGeneratorsConfiguration.generators.length).toEqual(1);
    });

    it("skip if present", () => {
        const generatorsConfiguration: GeneratorsConfigurationSchema = {
            generators: [
                {
                    name: "fernapi/fern-typescript",
                    version: "0.0.23",
                },
            ],
        };
        const addGeneratorResult = addTypescriptGenerator(generatorsConfiguration);
        expect(addGeneratorResult).toEqual(undefined);
    });
});
