import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { detectGlobalParams } from "../detectGlobalParams.js";

function header(args: {
    wireValue: string;
    name: string;
    valueType: FernIr.TypeReference;
    env?: string;
    clientDefault?: FernIr.Literal;
}): FernIr.HttpHeader {
    return {
        name: { name: args.name, wireValue: args.wireValue },
        valueType: args.valueType,
        env: args.env,
        clientDefault: args.clientDefault,
        defaultValue: undefined,
        v2Examples: undefined,
        availability: undefined,
        docs: undefined
    };
}

const optionalString = FernIr.TypeReference.container(
    FernIr.ContainerType.optional(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
);
const requiredString = FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });

describe("detectGlobalParams", () => {
    it("lowers an API-wide header with env + client-default into an auto header param", () => {
        const [binding, ...rest] = detectGlobalParams({
            globalParameters: [],
            apiWideHeaders: [
                header({
                    wireValue: "Twilio-Api-Version",
                    name: "twilioVersion",
                    valueType: optionalString,
                    env: "TWILIO_VERSION",
                    clientDefault: FernIr.Literal.string("2026-11-01.preview")
                })
            ]
        });

        expect(rest).toEqual([]);
        expect(binding?.paramName).toBe("Twilio-Api-Version");
        expect(binding?.envVar).toBe("TWILIO_VERSION");
        expect(binding?.rustCall).toContain('name: "Twilio-Api-Version".into()');
        expect(binding?.rustCall).toContain('target: "Twilio-Api-Version".into()');
        expect(binding?.rustCall).toContain("location: GlobalParameterLocation::Header");
        expect(binding?.rustCall).toContain('env: Some("TWILIO_VERSION".into())');
        expect(binding?.rustCall).toContain('default: Some("2026-11-01.preview".into())');
        expect(binding?.rustCall).toContain("optional: true");
        expect(binding?.rustCall).toContain("apply: GlobalParameterApplyMode::Auto");
        expect(binding?.rustCall).toContain('parameter_name: Some("twilioVersion".into())');
    });

    it("marks a non-optional header as required", () => {
        const [binding] = detectGlobalParams({
            globalParameters: [],
            apiWideHeaders: [header({ wireValue: "X-Tenant", name: "tenant", valueType: requiredString })]
        });

        expect(binding?.rustCall).toContain("optional: false");
        expect(binding?.rustCall).toContain("default: None");
    });

    it("lets a globalParameters entry win over the API-wide header on the same target", () => {
        const bindings = detectGlobalParams({
            globalParameters: [
                {
                    id: "version",
                    name: "Twilio-Api-Version",
                    location: "header",
                    target: "twilio-api-version",
                    valueType: requiredString,
                    env: "FROM_EXTENSION",
                    clientDefault: undefined,
                    optional: true,
                    apply: "auto",
                    docs: undefined
                }
            ],
            apiWideHeaders: [
                header({
                    wireValue: "Twilio-Api-Version",
                    name: "twilioVersion",
                    valueType: optionalString,
                    env: "TWILIO_VERSION"
                })
            ]
        });

        expect(bindings).toHaveLength(1);
        expect(bindings[0]?.envVar).toBe("FROM_EXTENSION");
    });
});
