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
    opts: { variable?: string; typeReference?: FernIr.dynamic.TypeReference; sdkName?: string } = {}
): FernIr.dynamic.NamedParameter {
    // sdkName models an x-fern-parameter-name rename: the SDK-facing identifier differs from the wire name.
    return {
        name: { wireValue, name: nm(opts.sdkName ?? wireValue) },
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
    headers,
    body
}: {
    group: string[];
    method: string;
    location: FernIr.dynamic.EndpointLocation;
    pathParameters?: FernIr.dynamic.NamedParameter[];
    queryParameters?: FernIr.dynamic.NamedParameter[];
    headers?: FernIr.dynamic.NamedParameter[];
    body?: FernIr.dynamic.InlinedRequestBody;
}): FernIr.dynamic.Endpoint {
    const declaration: FernIr.dynamic.Declaration = {
        fernFilepath: { allParts: group.map(nm), packagePath: group.map(nm) },
        name: nm(method)
    };
    return {
        declaration,
        location,
        request: { type: "inlined", declaration, pathParameters, queryParameters, headers, body },
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

    it("derives the flag from the wire name, not the importer's SDK name", () => {
        // The dynamic IR's SDK name is rewritten by the importer beyond any x-fern-parameter-name
        // rename (e.g. it drops the `X-` prefix from headers), so the flag must come from the wire
        // name to match the runtime. KNOWN GAP: a genuine x-fern-parameter-name rename can't be
        // reproduced because the dynamic IR doesn't distinguish it from automatic renames — the flag
        // falls back to the wire name here (see README).
        const ir = buildIr(
            inlinedEndpoint({
                group: ["messages"],
                method: "create",
                location: { method: "POST", path: "/Messages" },
                // wire name PageSize; importer SDK name differs ("limit") but the flag is wire-based.
                queryParameters: [param("PageSize", { sdkName: "limit" })]
            })
        );
        const result = generate(ir, {
            endpoint: { method: "POST", path: "/Messages" },
            queryParameters: { PageSize: 20 }
        });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe("twilio messages create --page-size 20");
    });

    it("derives a header flag from the wire name, keeping the X- prefix", () => {
        // Regression guard: the importer renames X-Custom-Header's SDK name to `customHeader`; the
        // flag must stay wire-based (`--x-custom-header`), matching the runtime --schema golden.
        const ir = buildIr(
            inlinedEndpoint({
                group: ["messages"],
                method: "create",
                location: { method: "POST", path: "/Messages" },
                headers: [param("X-Custom-Header", { sdkName: "customHeader" })]
            })
        );
        const result = generate(ir, {
            endpoint: { method: "POST", path: "/Messages" },
            headers: { "X-Custom-Header": "custom-value" }
        });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe("twilio messages create --x-custom-header custom-value");
    });

    it("drops the second parameter when two resolve to the same flag (keep-first)", () => {
        const ir = buildIr(
            inlinedEndpoint({
                group: ["messages"],
                method: "create",
                location: { method: "POST", path: "/Messages" },
                // Both wire names kebab to the same flag `--page-size`; the runtime keeps the first.
                queryParameters: [param("PageSize"), param("page_size")]
            })
        );
        const result = generate(ir, {
            endpoint: { method: "POST", path: "/Messages" },
            queryParameters: { PageSize: 20, page_size: 50 }
        });
        expect(result.snippet).toBe("twilio messages create --page-size 20");
        // The dropped colliding parameter surfaces as a warning (consistent with omitted fields).
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0]?.severity).toBe("WARNING");
        expect(result.errors?.[0]?.message).toContain("page_size");
    });

    it("omits a reserved multipart field (no flag, no bogus --output-param)", () => {
        // Multipart (file-upload) fields follow resolve_multipart_field_flag_name: a reserved name
        // (output) gets NO flag. It also can't be delivered via --params (the runtime mis-routes it
        // into the query string), so it is omitted entirely rather than emitting --output-param.
        const fileUploadBody = {
            type: "fileUpload",
            properties: [
                { type: "file", wireValue: "ProfileImage", name: nm("ProfileImage") },
                { type: "bodyProperty", name: { wireValue: "output", name: nm("output") }, typeReference: STRING },
                { type: "bodyProperty", name: { wireValue: "To", name: nm("To") }, typeReference: STRING }
            ]
        } as unknown as FernIr.dynamic.InlinedRequestBody;
        const ir = buildIr(
            inlinedEndpoint({
                group: ["media"],
                method: "upload",
                location: { method: "POST", path: "/Media" },
                body: fileUploadBody
            })
        );
        const result = generate(ir, {
            endpoint: { method: "POST", path: "/Media" },
            requestBody: { ProfileImage: "/path/img.png", output: "raw", To: "+15551234567" }
        });
        expect(result.snippet).toBe("twilio media upload --profile-image /path/img.png --to +15551234567");
        // The dropped reserved multipart field surfaces as a warning rather than disappearing silently.
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0]?.severity).toBe("WARNING");
        expect(result.errors?.[0]?.message).toContain("output");
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

    it("normalizes an acronym/mixed-case binaryName like the CLI (MyCLI -> mycli)", () => {
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
            { binaryName: "MyCLI" }
        );
        // camelToKebab would give `my-c-l-i`; the CLI's toKebabCase gives `mycli` (the real binary).
        expect(result.snippet).toBe("mycli messages create --to +1555");
    });

    it("nests commands under customConfig.rootGroup", () => {
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
            { binaryName: "acme", rootGroup: "api" }
        );
        expect(result.snippet).toBe("acme api messages create --to +1555");
    });

    describe("customConfig.namespaces", () => {
        const credentialsList = (group: string[]) =>
            buildIr(
                inlinedEndpoint({
                    group,
                    method: "list",
                    location: { method: "GET", path: "/v1/Credentials" }
                })
            );
        const request = { endpoint: { method: "GET", path: "/v1/Credentials" } } as const;

        it("mounts a slash namespace as nested verbatim segments", () => {
            const result = generate(credentialsList(["accountsV1", "credentials"]), request, {
                binaryName: "twilio",
                namespaces: { accountsV1: "accounts/v1" }
            });
            expect(result.snippet).toBe("twilio accounts v1 credentials list");
        });

        it("keeps the kebab-cased part when no namespaces map is set", () => {
            const result = generate(credentialsList(["accountsV1", "credentials"]), request, {
                binaryName: "twilio"
            });
            expect(result.snippet).toBe("twilio accounts-v1 credentials list");
        });

        it("leaves groups that are not in the map unchanged", () => {
            const result = generate(credentialsList(["core", "credentials"]), request, {
                binaryName: "twilio",
                namespaces: { accountsV1: "accounts/v1" }
            });
            expect(result.snippet).toBe("twilio core credentials list");
        });

        it("hoists a resource named like the namespace leaf (runtime stutter elision)", () => {
            const result = generate(credentialsList(["v3Customers", "customers"]), request, {
                binaryName: "bigcommerce",
                namespaces: { v3Customers: "v3/customers" }
            });
            expect(result.snippet).toBe("bigcommerce v3 customers list");
        });

        it("composes with rootGroup", () => {
            const result = generate(credentialsList(["accountsV1", "credentials"]), request, {
                binaryName: "twilio",
                rootGroup: "api",
                namespaces: { accountsV1: "accounts/v1" }
            });
            expect(result.snippet).toBe("twilio api accounts v1 credentials list");
        });
    });

    it("emits an explicit null as the runtime's null sentinel (--flag null), not dropped", () => {
        const ir = buildIr(
            inlinedEndpoint({
                group: ["messages"],
                method: "update",
                location: { method: "PATCH", path: "/Messages" },
                body: { type: "properties", value: [param("Nickname")] }
            })
        );
        const result = generate(ir, {
            endpoint: { method: "PATCH", path: "/Messages" },
            requestBody: { Nickname: null }
        });
        expect(result.snippet).toBe("twilio messages update --nickname null");
    });

    it("suffixes -param on a parameter colliding with the profile flag when profiles are enabled", () => {
        const ir = buildIr(
            inlinedEndpoint({
                group: ["messages"],
                method: "create",
                location: { method: "POST", path: "/Messages" },
                queryParameters: [param("profile")]
            })
        );
        const result = generate(
            ir,
            { endpoint: { method: "POST", path: "/Messages" }, queryParameters: { profile: "x" } },
            { binaryName: "twilio", profiles: { enabled: true } }
        );
        // With profiles enabled the runtime reserves --profile, so the query param gets --profile-param.
        expect(result.snippet).toBe("twilio messages create --profile-param x");
    });

    it("uses the SDK name for a special-character (renamed) wire name, avoiding a collision", () => {
        // Heuristic: `DateCreated<` has a char sanitizing drops, so it must be an x-fern-parameter-name
        // rename — use the SDK name (dateCreatedBefore → --date-created-before) instead of sanitizing the
        // wire name to --date-created (which would collide with a plain DateCreated).
        const ir = buildIr(
            inlinedEndpoint({
                group: ["messages"],
                method: "list",
                location: { method: "GET", path: "/Messages" },
                queryParameters: [
                    param("DateCreated"),
                    param("DateCreated<", { sdkName: "dateCreatedBefore" }),
                    param("DateCreated>", { sdkName: "dateCreatedAfter" })
                ]
            })
        );
        const result = generate(ir, {
            endpoint: { method: "GET", path: "/Messages" },
            queryParameters: { DateCreated: "d", "DateCreated<": "b", "DateCreated>": "a" }
        });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe(
            "twilio messages list --date-created d --date-created-before b --date-created-after a"
        );
    });

    it("sends a non-object referenced body through --json", () => {
        const declaration: FernIr.dynamic.Declaration = {
            fernFilepath: { allParts: [nm("exports")], packagePath: [nm("exports")] },
            name: nm("create")
        };
        const endpoint = {
            declaration,
            location: { method: "POST", path: "/Exports" },
            request: { type: "body", body: { type: "typeReference", value: { type: "list", value: STRING } } },
            response: { type: "json" }
        } as unknown as FernIr.dynamic.Endpoint;
        const ir = buildIr(endpoint);
        const result = generate(ir, { endpoint: { method: "POST", path: "/Exports" }, requestBody: ["a", "b"] });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe(`twilio exports create --json '["a","b"]'`);
    });
});
