import { GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { createMockTaskContext, FernCliError } from "@fern-api/task-context";
import { addGenerator } from "../addGenerator";
import { JAVA_GENERATOR_INVOCATION } from "../generatorInvocations";

describe("addGenerator", () => {
    it("adds generator if not present", () => {
        const generatorsConfiguration: GeneratorsConfigurationSchema = {};
        const newConfiguration = addGenerator({
            generatorName: "java",
            generatorsConfiguration,
            context: createMockTaskContext(),
        });
        expect(newConfiguration.draft).toMatchObject([
            {
                name: JAVA_GENERATOR_INVOCATION.name,
            },
        ]);
    });

    it("fail if present", () => {
        const generatorsConfiguration: GeneratorsConfigurationSchema = {
            draft: [
                {
                    name: "fernapi/fern-typescript-sdk",
                    version: "0.0.23",
                    mode: "publish",
                },
            ],
        };

        expect(() =>
            addGenerator({
                generatorName: "typescript",
                generatorsConfiguration,
                context: createMockTaskContext(),
            })
        ).toThrow(FernCliError);
    });
});
