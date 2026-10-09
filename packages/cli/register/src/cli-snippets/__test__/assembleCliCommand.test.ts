import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { describe, expect, it } from "vitest";
import { assembleCliCommand } from "../assembleCliCommand.js";
import { CliCatalogCommand } from "../types.js";

type ExampleEndpointCall = FdrCjsSdk.api.v1.register.ExampleEndpointCall;

function makeExample(partial: Partial<ExampleEndpointCall>): ExampleEndpointCall {
    return {
        path: "",
        pathParameters: {},
        queryParameters: {},
        headers: {},
        responseStatusCode: 200,
        ...partial
    } as ExampleEndpointCall;
}

const MESSAGES_CREATE: CliCatalogCommand = {
    command: ["twilio", "api", "core", "v2010", "accounts", "messages", "create"],
    namespace: "core",
    httpMethod: "POST",
    path: "/2010-04-01/Accounts/{AccountSid}/Messages.json",
    inputs: [
        { wireName: "AccountSid", location: "path", flag: "--account-sid" },
        { wireName: "To", location: "body", flag: "--to" },
        { wireName: "Body", location: "body", flag: "--body" },
        { wireName: "PageSize", location: "query", flag: "--page-size" }
    ]
};

describe("assembleCliCommand", () => {
    it("assembles path + body + query flags in declared order", () => {
        const code = assembleCliCommand(
            MESSAGES_CREATE,
            makeExample({
                pathParameters: { AccountSid: "AC123" },
                requestBodyV3: { type: "json", value: { To: "+15551234567", Body: "Hello world" } },
                queryParameters: { PageSize: 20 }
            })
        );
        expect(code).toBe(
            "twilio api core v2010 accounts messages create --account-sid AC123 --to +15551234567 --body 'Hello world' --page-size 20"
        );
    });

    it("omits flags whose value is absent from the example", () => {
        const code = assembleCliCommand(
            MESSAGES_CREATE,
            makeExample({
                pathParameters: { AccountSid: "AC123" },
                requestBodyV3: { type: "json", value: { To: "+15551234567" } }
            })
        );
        expect(code).toBe("twilio api core v2010 accounts messages create --account-sid AC123 --to +15551234567");
    });

    it("renders booleans as true/false", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "update"],
            httpMethod: "POST",
            path: "/x",
            inputs: [{ wireName: "Enabled", location: "body", flag: "--enabled" }]
        };
        const code = assembleCliCommand(
            command,
            makeExample({ requestBodyV3: { type: "json", value: { Enabled: false } } })
        );
        expect(code).toBe("twilio x update --enabled false");
    });

    it("repeats the flag once per element for repeated array inputs", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "create"],
            httpMethod: "POST",
            path: "/x",
            inputs: [{ wireName: "MediaUrl", location: "body", flag: "--media-url", repeated: true }]
        };
        const code = assembleCliCommand(
            command,
            makeExample({
                requestBodyV3: { type: "json", value: { MediaUrl: ["https://a.png", "https://b.png"] } }
            })
        );
        expect(code).toBe("twilio x create --media-url https://a.png --media-url https://b.png");
    });

    it("reads nested flattened body fields by their key path", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "create"],
            httpMethod: "POST",
            path: "/x",
            inputs: [{ wireName: "City", location: "body", flag: "--address.city", path: ["Address", "City"] }]
        };
        const code = assembleCliCommand(
            command,
            makeExample({ requestBodyV3: { type: "json", value: { Address: { City: "SF" } } } })
        );
        expect(code).toBe("twilio x create --address.city SF");
    });

    it("routes flagless inputs through --params, reconstructing their subtree", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "create"],
            httpMethod: "POST",
            path: "/x",
            inputs: [
                { wireName: "To", location: "body", flag: "--to" },
                // No `flag` → the runtime only accepts this input via --params.
                { wireName: "Rules", location: "body" }
            ]
        };
        const code = assembleCliCommand(
            command,
            makeExample({
                requestBodyV3: {
                    type: "json",
                    value: { To: "+15551234567", Rules: [{ type: "allow", value: 1 }] }
                }
            })
        );
        expect(code).toBe(`twilio x create --to +15551234567 --params '{"Rules":[{"type":"allow","value":1}]}'`);
    });

    it("routes non-repeated arrays and nested objects through --params automatically", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "create"],
            httpMethod: "POST",
            path: "/x",
            inputs: [
                { wireName: "Tags", location: "body", flag: "--tags" },
                { wireName: "Config", location: "body", flag: "--config" }
            ]
        };
        const code = assembleCliCommand(
            command,
            makeExample({
                requestBodyV3: { type: "json", value: { Tags: ["a", "b"], Config: { nested: true } } }
            })
        );
        expect(code).toBe(`twilio x create --params '{"Tags":["a","b"],"Config":{"nested":true}}'`);
    });

    it("sends the whole body via --json when a body input is a literal dotted key (no path)", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "core", "calls", "streams", "create"],
            namespace: "core",
            httpMethod: "POST",
            path: "/2010-04-01/Accounts/{AccountSid}/Calls/{CallSid}/Streams.json",
            inputs: [
                { wireName: "AccountSid", location: "path", flag: "--account-sid" },
                { wireName: "CallSid", location: "path", flag: "--call-sid" },
                { wireName: "Url", location: "body", flag: "--url" },
                // Literal dotted keys: dotted wire name, NO path. These force the body to --json.
                { wireName: "Parameter1.Name", location: "body", flag: "--parameter1.-name" },
                { wireName: "Parameter1.Value", location: "body", flag: "--parameter1.-value" }
            ]
        };
        const code = assembleCliCommand(
            command,
            makeExample({
                pathParameters: { AccountSid: "AC123", CallSid: "CA456" },
                requestBodyV3: {
                    type: "json",
                    value: { Url: "https://example.com", "Parameter1.Name": "n1", "Parameter1.Value": "v1" }
                }
            })
        );
        // Path flags stay; the entire body (including Url) goes through --json, no per-field body flags.
        expect(code).toBe(
            `twilio core calls streams create --account-sid AC123 --call-sid CA456 ` +
                `--json '{"Url":"https://example.com","Parameter1.Name":"n1","Parameter1.Value":"v1"}'`
        );
    });

    it("keeps real nested fields (with path) as flattened dotted flags, not --json", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "create"],
            namespace: "core",
            httpMethod: "POST",
            path: "/x",
            inputs: [
                // Real nested field: dotted flag carries an explicit path → stays a flat flag.
                { wireName: "Address.City", location: "body", flag: "--address.city", path: ["Address", "City"] }
            ]
        };
        const code = assembleCliCommand(
            command,
            makeExample({ requestBodyV3: { type: "json", value: { Address: { City: "SF" } } } })
        );
        expect(code).toBe("twilio x create --address.city SF");
    });

    it("reconciles catalog wire names against divergent FDR field casing", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "get"],
            httpMethod: "GET",
            path: "/x/{AccountSid}",
            inputs: [{ wireName: "AccountSid", location: "path", flag: "--account-sid" }]
        };
        // FDR stored the path param as camelCase; catalog wire name is PascalCase.
        const code = assembleCliCommand(command, makeExample({ pathParameters: { accountSid: "AC9" } }));
        expect(code).toBe("twilio x get --account-sid AC9");
    });

    it("unwraps form request-body values", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "upload"],
            httpMethod: "POST",
            path: "/x",
            inputs: [{ wireName: "To", location: "body", flag: "--to" }]
        };
        const code = assembleCliCommand(
            command,
            makeExample({ requestBodyV3: { type: "form", value: { To: { type: "json", value: "+1555" } } } })
        );
        expect(code).toBe("twilio x upload --to +1555");
    });

    it("reads header-location inputs", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "get"],
            httpMethod: "GET",
            path: "/x",
            inputs: [{ wireName: "Idempotency-Key", location: "header", flag: "--idempotency-key" }]
        };
        const code = assembleCliCommand(command, makeExample({ headers: { "Idempotency-Key": "abc-123" } }));
        expect(code).toBe("twilio x get --idempotency-key abc-123");
    });

    it("falls back to the legacy requestBody when requestBodyV3 is absent", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "create"],
            httpMethod: "POST",
            path: "/x",
            inputs: [{ wireName: "Body", location: "body", flag: "--body" }]
        };
        const code = assembleCliCommand(command, makeExample({ requestBody: { Body: "hi" } }));
        expect(code).toBe("twilio x create --body hi");
    });
    it("renders repeated object elements as JSON, one flag per element", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "create"],
            httpMethod: "POST",
            path: "/x",
            inputs: [{ wireName: "Rules", location: "body", flag: "--rules", repeated: true }]
        };
        const code = assembleCliCommand(
            command,
            makeExample({ requestBodyV3: { type: "json", value: { Rules: [{ type: "allow" }, { type: "deny" }] } } })
        );
        expect(code).toBe(`twilio x create --rules '{"type":"allow"}' --rules '{"type":"deny"}'`);
    });

    it("keys flagless nested body fields in --params by their dotted path", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "create"],
            httpMethod: "POST",
            path: "/x",
            inputs: [{ wireName: "City", location: "body", path: ["Address", "City"] }]
        };
        const code = assembleCliCommand(
            command,
            makeExample({ requestBodyV3: { type: "json", value: { Address: { City: "SF" } } } })
        );
        expect(code).toBe(`twilio x create --params '{"Address.City":"SF"}'`);
    });

    it("skips an object parent input when its leaves are their own inputs", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x", "create"],
            httpMethod: "POST",
            path: "/x",
            inputs: [
                { wireName: "Address", location: "body", flag: "--address" },
                { wireName: "Address.City", location: "body", flag: "--address.city", path: ["Address", "City"] }
            ]
        };
        const code = assembleCliCommand(
            command,
            makeExample({ requestBodyV3: { type: "json", value: { Address: { City: "SF" } } } })
        );
        expect(code).toBe("twilio x create --address.city SF");
    });

    it("shell-quotes catalog command tokens and flags that contain shell syntax", () => {
        const command: CliCatalogCommand = {
            command: ["twilio", "x;rm -rf ~", "create"],
            httpMethod: "POST",
            path: "/x",
            inputs: [{ wireName: "To", location: "body", flag: "--to$(id)" }]
        };
        const code = assembleCliCommand(command, makeExample({ requestBodyV3: { type: "json", value: { To: "a" } } }));
        expect(code).toBe(`twilio 'x;rm -rf ~' create '--to$(id)' a`);
    });
});
