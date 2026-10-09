import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { describe, expect, it } from "vitest";

import { DynamicSnippetsGenerator } from "../DynamicSnippetsGenerator.js";

/** Minimal GeneratorConfig; workspaceName seeds the binary name when customConfig.binaryName is unset. */
function buildConfig(customConfig: Record<string, unknown> = {}): FernGeneratorExec.GeneratorConfig {
    return {
        dryRun: false,
        irFilepath: "<placeholder>",
        output: {
            path: "<placeholder>",
            mode: FernGeneratorExec.OutputMode.github({
                version: "v1.0.0",
                repoUrl: "https://github.com/acme/acme-cli"
            })
        },
        organization: "acme",
        workspaceName: "twilio",
        environment: FernGeneratorExec.GeneratorEnvironment.local(),
        whitelabel: false,
        writeUnitTests: false,
        generateOauthClients: false,
        customConfig
    };
}

const STRING: FernIr.dynamic.TypeReference = { type: "primitive", value: "STRING" };

function nm(originalName: string): FernIr.dynamic.Name {
    const s = { safeName: originalName, unsafeName: originalName };
    return { originalName, camelCase: s, pascalCase: s, snakeCase: s, screamingSnakeCase: s };
}

function param(
    wireValue: string,
    opts: { variable?: string; typeReference?: FernIr.dynamic.TypeReference } = {}
): FernIr.dynamic.NamedParameter {
    return {
        name: { wireValue, name: nm(wireValue) },
        typeReference: opts.typeReference ?? STRING,
        variable: opts.variable
    };
}

/** Build a single-endpoint dynamic IR with an inlined request. */
function buildIr(endpoint: FernIr.dynamic.Endpoint): FernIr.dynamic.DynamicIntermediateRepresentation {
    return {
        version: "1.0.0",
        types: {},
        endpoints: { endpoint }
    } as FernIr.dynamic.DynamicIntermediateRepresentation;
}

function inlinedEndpoint({
    group,
    method,
    location,
    pathParameters,
    queryParameters,
    body
}: {
    group: string[];
    method: string;
    location: FernIr.dynamic.EndpointLocation;
    pathParameters?: FernIr.dynamic.NamedParameter[];
    queryParameters?: FernIr.dynamic.NamedParameter[];
    body?: FernIr.dynamic.InlinedRequestBody;
}): FernIr.dynamic.Endpoint {
    const declaration: FernIr.dynamic.Declaration = {
        fernFilepath: { allParts: group.map(nm), packagePath: group.map(nm) },
        name: nm(method)
    };
    return {
        declaration,
        location,
        request: { type: "inlined", declaration, pathParameters, queryParameters, body },
        response: { type: "json" }
    } as unknown as FernIr.dynamic.Endpoint;
}

function generate(
    ir: FernIr.dynamic.DynamicIntermediateRepresentation,
    request: FernIr.dynamic.EndpointSnippetRequest,
    customConfig?: Record<string, unknown>
): FernIr.dynamic.EndpointSnippetResponse {
    return new DynamicSnippetsGenerator({ ir, config: buildConfig(customConfig) }).generateSync(request);
}

describe("DynamicSnippetsGenerator", () => {
    it("renders binary + group + method with query and body flags", () => {
        const ir = buildIr(
            inlinedEndpoint({
                group: ["messages"],
                method: "create",
                location: { method: "POST", path: "/Messages" },
                queryParameters: [param("PageSize")],
                body: { type: "properties", value: [param("To"), param("From"), param("Body")] }
            })
        );
        const result = generate(ir, {
            endpoint: { method: "POST", path: "/Messages" },
            queryParameters: { PageSize: 20 },
            requestBody: { To: "+15551234567", From: "+15559876543", Body: "Hello" }
        });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe(
            "twilio messages create --page-size 20 --to +15551234567 --from +15559876543 --body Hello"
        );
    });

    it("omits path parameters bound to a client variable (globals)", () => {
        const ir = buildIr(
            inlinedEndpoint({
                group: ["messages"],
                method: "get",
                location: { method: "GET", path: "/Accounts/{AccountSid}/Messages/{Sid}" },
                pathParameters: [param("AccountSid", { variable: "account_sid" }), param("Sid")]
            })
        );
        const result = generate(ir, {
            endpoint: { method: "GET", path: "/Accounts/{AccountSid}/Messages/{Sid}" },
            pathParameters: { AccountSid: "AC123", Sid: "SM456" }
        });
        expect(result.errors).toBeUndefined();
        // AccountSid is configured out of band (env/profile) and omitted; Sid is a per-command flag.
        expect(result.snippet).toBe("twilio messages get --sid SM456");
    });

    it("sends literal-dotted body keys through --json", () => {
        const ir = buildIr(
            inlinedEndpoint({
                group: ["calls"],
                method: "create",
                location: { method: "POST", path: "/Calls" },
                body: { type: "properties", value: [param("To"), param("Parameter1.Name")] }
            })
        );
        const result = generate(ir, {
            endpoint: { method: "POST", path: "/Calls" },
            requestBody: { To: "+1555", "Parameter1.Name": "foo" }
        });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe(`twilio calls create --json '{"To":"+1555","Parameter1.Name":"foo"}'`);
    });

    it("repeats scalar-array flags and routes objects to --params", () => {
        const ir = buildIr(
            inlinedEndpoint({
                group: ["messages"],
                method: "create",
                location: { method: "POST", path: "/Messages" },
                queryParameters: [param("Tag", { typeReference: { type: "list", value: STRING } })],
                body: { type: "properties", value: [param("Metadata")] }
            })
        );
        const result = generate(ir, {
            endpoint: { method: "POST", path: "/Messages" },
            queryParameters: { Tag: ["a", "b"] },
            requestBody: { Metadata: { key: "value" } }
        });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe(`twilio messages create --tag a --tag b --params '{"Metadata":{"key":"value"}}'`);
    });

    it("suffixes -param on body fields that collide with a built-in flag", () => {
        const ir = buildIr(
            inlinedEndpoint({
                group: ["messages"],
                method: "create",
                location: { method: "POST", path: "/Messages" },
                body: { type: "properties", value: [param("json")] }
            })
        );
        const result = generate(ir, {
            endpoint: { method: "POST", path: "/Messages" },
            requestBody: { json: "raw" }
        });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe("twilio messages create --json-param raw");
    });

    it("honors a binaryName custom config override", () => {
        const ir = buildIr(
            inlinedEndpoint({
                group: ["messages"],
                method: "create",
                location: { method: "POST", path: "/Messages" },
                body: { type: "properties", value: [param("To")] }
            })
        );
        const result = generate(
            ir,
            { endpoint: { method: "POST", path: "/Messages" }, requestBody: { To: "+1555" } },
            { binaryName: "my-cli" }
        );
        expect(result.snippet).toBe("my-cli messages create --to +1555");
    });
});
