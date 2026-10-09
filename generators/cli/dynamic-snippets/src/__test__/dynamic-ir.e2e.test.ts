import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { describe, expect, it } from "vitest";

import { DynamicSnippetsGenerator } from "../DynamicSnippetsGenerator.js";

/**
 * End-to-end parity using the REAL dynamic IR. The committed `dynamic-ir.json` is the output of the
 * fern pipeline (loadAPIWorkspace → getIntermediateRepresentation → convertIrToDynamicSnippetsIr) on
 * `twilio-like/openapi.yml`, and `schema.golden.json` is the Rust runtime's own `--schema`. Running
 * the generator over that IR and asserting the command path against the golden closes the naming gap:
 * the command group/method come from the importer's `fernFilepath` + `declaration.name`, while the
 * runtime derives them in its Rust parser — this proves the two agree for the fixture.
 *
 * Regenerate `dynamic-ir.json` with the pipeline when the fixture spec changes (see PR notes):
 *   convertIrToDynamicSnippetsIr({ ir, smartCasing: true, disableExamples: true })
 */

interface GoldenInput {
    wireName: string;
    location: string;
    flag?: string;
}
interface GoldenCommand {
    operation: string;
    command: string[];
    httpMethod: string;
    path: string;
    inputs: GoldenInput[];
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(__dirname, "fixtures", "twilio-like");
const BINARY = "twilio-like";

const dynamicIr = JSON.parse(
    readFileSync(join(FIXTURE, "dynamic-ir.json"), "utf-8")
) as FernIr.dynamic.DynamicIntermediateRepresentation;
const golden = JSON.parse(readFileSync(join(FIXTURE, "schema.golden.json"), "utf-8")) as {
    commands: GoldenCommand[];
};

const CONFIG = {
    dryRun: false,
    irFilepath: "<placeholder>",
    output: { path: "<placeholder>", mode: { type: "publish" } },
    organization: "twilio-like",
    workspaceName: BINARY,
    environment: { type: "local" },
    whitelabel: false,
    writeUnitTests: false,
    generateOauthClients: false,
    customConfig: {}
} as unknown as FernGeneratorExec.GeneratorConfig;

function generator(): DynamicSnippetsGenerator {
    return new DynamicSnippetsGenerator({ ir: dynamicIr, config: CONFIG });
}

describe("command-name parity with the runtime --schema golden (real dynamic IR)", () => {
    for (const command of golden.commands) {
        it(`${command.httpMethod} ${command.path} → ${command.command.join(" ")}`, () => {
            // With no values supplied, no flags emit — the snippet is exactly the command path, so this
            // isolates naming (binary + group + method) derived from the real dynamic IR.
            const result = generator().generateSync({
                endpoint: { method: command.httpMethod as FernIr.dynamic.HttpMethod, path: command.path }
            });
            expect(result.errors).toBeUndefined();
            expect(result.snippet).toBe(`${BINARY} ${command.command.join(" ")}`);
        });
    }
});

describe("flag emission from the real dynamic IR", () => {
    it("renders path + body flags for a clean body", () => {
        const result = generator().generateSync({
            endpoint: { method: "POST", path: "/2010-04-01/Accounts/{AccountSid}/Messages.json" },
            pathParameters: { AccountSid: "AC123" },
            requestBody: { To: "+15558675310", From: "+15017122661", Body: "Hello" }
        });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe(
            "twilio-like messages create-message --account-sid AC123 --to +15558675310 --from +15017122661 --body Hello"
        );
    });

    it("keeps the header X- prefix and reserved-suffixes a built-in body flag", () => {
        // X-Custom-Header's SDK name is `customHeader` in the dynamic IR (the importer drops the X-),
        // but the flag must stay `--x-custom-header`. The reserved `json` body field becomes --json-param.
        const result = generator().generateSync({
            endpoint: { method: "POST", path: "/2010-04-01/Accounts/{AccountSid}/Calls.json" },
            pathParameters: { AccountSid: "AC123" },
            headers: { "X-Custom-Header": "hval" },
            requestBody: { To: "+15558675310", json: "raw" }
        });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe(
            "twilio-like calls create-call --account-sid AC123 --x-custom-header hval --to +15558675310 --json-param raw"
        );
    });

    it("flattens a nested object body field into --params (accepted by the runtime)", () => {
        const result = generator().generateSync({
            endpoint: { method: "POST", path: "/2010-04-01/Accounts/{AccountSid}/Addresses.json" },
            pathParameters: { AccountSid: "AC123" },
            requestBody: { CustomerName: "Ada", Address: { City: "SF", Zip: "94105" } }
        });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe(
            `twilio-like addresses create-address --account-sid AC123 --customer-name Ada --params '{"Address":{"City":"SF","Zip":"94105"}}'`
        );
    });

    it("emits a namespaced (multi-part) command path", () => {
        const result = generator().generateSync({
            endpoint: { method: "POST", path: "/Chat/v1/Messages" },
            requestBody: { Body: "hi" }
        });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe("twilio-like chat v1 send --body hi");
    });

    it("emits a multipart file flag and omits a reserved multipart field", () => {
        // A reserved multipart field (output) can't be delivered — the runtime mis-routes it into the
        // query string rather than the form (confirmed by the dry-run e2e) — so it is omitted.
        const result = generator().generateSync({
            endpoint: { method: "POST", path: "/2010-04-01/Accounts/{AccountSid}/Media.json" },
            pathParameters: { AccountSid: "AC123" },
            requestBody: { File: "/tmp/image.png", output: "meta" }
        });
        expect(result.snippet).toBe("twilio-like media upload-media --account-sid AC123 --file /tmp/image.png");
        // The dropped reserved field surfaces as a warning so docs can flag the missing input.
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0]?.severity).toBe("WARNING");
        expect(result.errors?.[0]?.message).toContain("output");
    });

    it("sends a literal-dotted body through --json", () => {
        const result = generator().generateSync({
            endpoint: { method: "POST", path: "/2010-04-01/Accounts/{AccountSid}/Calls/Stream.json" },
            pathParameters: { AccountSid: "AC123" },
            requestBody: { To: "+15558675310", "Parameter1.Name": "foo" }
        });
        expect(result.errors).toBeUndefined();
        expect(result.snippet).toBe(
            `twilio-like calls create-call-stream --account-sid AC123 --json '{"To":"+15558675310","Parameter1.Name":"foo"}'`
        );
    });
});
