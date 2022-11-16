import { GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { createMockTaskContext, FernCliError } from "@fern-api/task-context";
import { addGenerator } from "../addGenerator";
import { JAVA_GENERATOR_INVOCATION } from "../generatorInvocations";

describe("addGenerator", () => {
    it("adds generator if not present", () => {
        const generatorsConfiguration: GeneratorsConfigurationSchema = {
            groups: {},
        };
        const newConfiguration = addGenerator({
            generatorName: "java",
            generatorsConfiguration,
            context: createMockTaskContext(),
        });

        const expectedNewConfiguration: GeneratorsConfigurationSchema = {
            groups: {
                external: {
                    audiences: "all",
                    generators: [JAVA_GENERATOR_INVOCATION],
                },
            },
        };

        expect(newConfiguration).toEqual(expectedNewConfiguration);
    });

    it("fail if present", () => {
        const generatorsConfiguration: GeneratorsConfigurationSchema = {
            groups: {
                external: {
                    audiences: "all",
                    generators: [
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "0.0.23",
                        },
                    ],
                },
            },
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
