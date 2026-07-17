import { FernIr } from "@fern-fern/ir-sdk";
import { caseConverter, casingsGenerator, createMinimalIR } from "@fern-typescript/test-utils";
import { describe, expect, it } from "vitest";

import { getServerVariableOptions } from "../serverVariables.js";

function createServerVariable(opts: {
    id: string;
    name: string;
    default?: string;
    values?: string[];
}): FernIr.ServerVariable {
    return {
        id: opts.id,
        name: casingsGenerator.generateName(opts.name),
        default: opts.default,
        values: opts.values
    };
}

function createSingleBaseUrlIR(): FernIr.IntermediateRepresentation {
    const region = createServerVariable({
        id: "region",
        name: "region",
        default: "us-east-1",
        values: ["us-east-1", "eu-west-1"]
    });
    const ir = createMinimalIR();
    ir.environments = {
        defaultEnvironment: "Default",
        environments: FernIr.Environments.singleBaseUrl({
            environments: [
                {
                    id: "Default",
                    name: casingsGenerator.generateName("Default"),
                    url: "https://api.example.com",
                    urlTemplate: "https://api.{region}.example.com",
                    urlVariables: [region],
                    audiences: undefined,
                    defaultUrl: undefined,
                    docs: undefined
                }
            ]
        })
    };
    return ir;
}

describe("getServerVariableOptions", () => {
    it("returns the declared server URL variables by default (serverUrlVariables enabled)", () => {
        const options = getServerVariableOptions(createSingleBaseUrlIR(), caseConverter);
        expect(options).toHaveLength(1);
        expect(options[0]?.optionName).toBe("region");
        expect(options[0]?.localName).toBe("_region");
    });

    it("returns the declared server URL variables when serverUrlVariables is explicitly true", () => {
        const options = getServerVariableOptions(createSingleBaseUrlIR(), caseConverter, true);
        expect(options).toHaveLength(1);
    });

    it("returns no options when serverUrlVariables is false (feature opted out)", () => {
        const options = getServerVariableOptions(createSingleBaseUrlIR(), caseConverter, false);
        expect(options).toHaveLength(0);
    });
});
