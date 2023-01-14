import { GeneratorName, GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { NOOP_LOGGER } from "@fern-api/logger";
import { createMockTaskContext, FernCliError } from "@fern-api/task-context";
import { addGenerator } from "../addGenerator";

describe("addGenerator", () => {
    it("adds generator if not present", () => {
        const generatorsConfiguration: GeneratorsConfigurationSchema = {
            groups: {},
        };
        const newConfiguration = addGenerator({
            generatorName: "fern-java",
            generatorsConfiguration,
            context: createMockTaskContext(),
        });

        const expectedNewConfiguration: GeneratorsConfigurationSchema = {
            groups: {
                external: {
                    generators: [
                        {
                            name: GeneratorName.JAVA,
                            version: expect.any(String),
                        },
                    ],
                },
            },
        };

        expect(newConfiguration).toEqual(expectedNewConfiguration);
    });

    it("fail if present", () => {
        const generatorsConfiguration: GeneratorsConfigurationSchema = {
            groups: {
                external: {
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
                context: createMockTaskContext({ logger: NOOP_LOGGER }),
            })
        ).toThrow(FernCliError);
    });
});
