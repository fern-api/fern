import { describe, expect, it } from "vitest";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { RootClientGenerator } from "../RootClientGenerator.js";

/**
 * Builds a minimal mock context exposing only the fields that
 * `getServerVariableOptions` / `collectServerVariables` read: the case
 * converter, the custom config, and a single-base-URL environment declaring
 * one server URL variable.
 */
function buildContext(customConfig: { serverUrlVariables?: boolean }): SdkGeneratorContext {
    return {
        caseConverter: {
            // The mock passes an already-snake_case name, so identity is sufficient.
            snakeSafe: (name: string) => name
        },
        customConfig,
        ir: {
            environments: {
                environments: {
                    type: "singleBaseUrl",
                    environments: [
                        {
                            urlVariables: [
                                {
                                    id: "region",
                                    name: "region",
                                    default: "us-east-1",
                                    values: undefined
                                }
                            ]
                        }
                    ]
                }
            }
        }
    } as unknown as SdkGeneratorContext;
}

function getOptions(customConfig: { serverUrlVariables?: boolean }): unknown[] {
    const generator = new RootClientGenerator(buildContext(customConfig));
    // getServerVariableOptions is private; invoke it directly to test the gate.
    return (generator as unknown as { getServerVariableOptions(): unknown[] }).getServerVariableOptions();
}

describe("RootClientGenerator server URL variable gate", () => {
    it("emits server URL variable options by default (serverUrlVariables unset)", () => {
        const options = getOptions({}) as { optionName: string }[];
        expect(options).toHaveLength(1);
        expect(options[0]?.optionName).toBe("region");
    });

    it("emits server URL variable options when serverUrlVariables is true", () => {
        const options = getOptions({ serverUrlVariables: true }) as { optionName: string }[];
        expect(options).toHaveLength(1);
        expect(options[0]?.optionName).toBe("region");
    });

    it("suppresses server URL variable options when serverUrlVariables is false", () => {
        const options = getOptions({ serverUrlVariables: false });
        expect(options).toEqual([]);
    });
});
