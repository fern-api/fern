import { GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { createMockTaskContext, TASK_FAILURE } from "@fern-api/task-context";
import { addGenerator } from "../addGenerator";
import { JAVA_GENERATOR_INVOCATION } from "../generatorInvocations";

describe("addGenerator", () => {
    it("adds generator if not present", () => {
        const generatorsConfiguration: GeneratorsConfigurationSchema = {
            generators: [],
        };
        const newConfiguration = addGenerator({
            generatorName: "java",
            generatorsConfiguration,
            context: createMockTaskContext(),
        });
        if (newConfiguration === TASK_FAILURE) {
            throw new Error("Failed to create new configuration");
        }
        expect(newConfiguration.generators).toMatchObject([
            {
                name: JAVA_GENERATOR_INVOCATION.name,
            },
        ]);
    });

    it("fail if present", () => {
        const generatorsConfiguration: GeneratorsConfigurationSchema = {
            generators: [
                {
                    name: "fernapi/fern-typescript",
                    version: "0.0.23",
                },
            ],
        };
        const newConfiguration = addGenerator({
            generatorName: "typescript",
            generatorsConfiguration,
            context: createMockTaskContext(),
        });
        expect(newConfiguration).toBe(TASK_FAILURE);
    });
});
