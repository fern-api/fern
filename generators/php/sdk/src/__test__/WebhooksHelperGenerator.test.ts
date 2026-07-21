import { FernIr } from "@fern-fern/ir-sdk";
import { execFileSync } from "child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { describe, expect, it } from "vitest";

import { WebhooksHelperGenerator } from "../webhooks/WebhooksHelperGenerator.js";

type HelperContext = ConstructorParameters<typeof WebhooksHelperGenerator>[0];

function buildContext(
    verification: FernIr.WebhookSignatureVerification,
    { name = "event", pascal = "Event" }: { name?: string; pascal?: string } = {}
): HelperContext {
    return {
        ir: {
            webhookGroups: {
                webhooks: [
                    {
                        name,
                        signatureVerification: verification
                    }
                ]
            }
        },
        customConfig: {},
        case: {
            pascalSafe: () => pascal
        },
        getRootNamespace: () => "Seed",
        getCoreNamespace: () => "Seed\\Core"
    } satisfies HelperContext;
}

function generate(verification: FernIr.WebhookSignatureVerification): string {
    const [file] = new WebhooksHelperGenerator(buildContext(verification)).generate();
    return file?.fileContents.toString() ?? "";
}

function hmacConfig(
    overrides: Partial<Omit<FernIr.HmacSignatureVerification, "type">> & {
        payloadFormat: FernIr.WebhookPayloadFormat;
    }
): FernIr.WebhookSignatureVerification {
    return FernIr.WebhookSignatureVerification.hmac({
        signatureHeaderName: "x-webhook-signature",
        algorithm: "SHA256",
        encoding: "HEX",
        signaturePrefix: undefined,
        timestamp: undefined,
        bodyHashBinding: undefined,
        notificationUrlNormalization: undefined,
        ...overrides
    });
}

const twilioConfig = (
    normalization?: FernIr.WebhookNotificationUrlNormalization
): FernIr.WebhookSignatureVerification =>
    hmacConfig({
        signatureHeaderName: "x-twilio-signature",
        algorithm: "SHA1",
        encoding: "BASE64",
        payloadFormat: {
            components: ["NOTIFICATION_URL", "BODY"],
            delimiter: "",
            bodySort: "ALPHABETICAL"
        },
        bodyHashBinding: {
            algorithm: "SHA256",
            encoding: "HEX",
            location: FernIr.WebhookBodyHashLocation.queryParameter({ name: "bodySHA256" })
        },
        notificationUrlNormalization: normalization
    });

describe("WebhooksHelperGenerator", () => {
    it("includes a timestamp parameter when the payload uses a timestamp without validation config", () => {
        const contents = generate(
            hmacConfig({
                payloadFormat: {
                    components: ["TIMESTAMP", "BODY"],
                    delimiter: ".",
                    bodySort: undefined
                }
            })
        );

        expect(contents).toContain("string|null $timestampHeader");
        expect(contents).toContain('$payload = implode(".", [$timestampHeader, $requestBody]);');
        expect(contents).not.toContain("Missing timestamp header");
    });

    it("never throws on the verification path: missing inputs return false", () => {
        const contents = generate(
            hmacConfig({
                payloadFormat: { components: ["BODY"], delimiter: "", bodySort: undefined },
                timestamp: {
                    headerName: "x-webhook-timestamp",
                    format: "UNIX_SECONDS",
                    tolerance: 300
                }
            })
        );

        expect(contents).not.toContain("throw new");
        expect(contents).toContain("return false;");
    });

    describe("behavior 1: multi-value form params", () => {
        it("dedupes and sorts each key's values and concatenates key+value", () => {
            const contents = generate(
                hmacConfig({
                    payloadFormat: {
                        components: ["BODY"],
                        delimiter: "",
                        bodySort: "ALPHABETICAL"
                    }
                })
            );

            // Native hint accepts arrays so the is_string guard selects the branch at runtime.
            expect(contents).toContain("string|array|null $requestBody");
            expect(contents).toContain("if (is_string($requestBody)) {");
            expect(contents).toContain("ksort($requestBody);");
            expect(contents).toContain("$values = is_array($value) ? $value : [$value];");
            expect(contents).toContain("$values = array_values(array_unique($values));");
            expect(contents).toContain("sort($values, SORT_STRING);");
            expect(contents).toContain("$bodyString .= $key . $singleValue;");
            // Empty-array check requires arrays to be accepted.
            expect(contents).toContain("$requestBody === []");
        });

        it("keeps a plain string body untouched when bodySort is absent", () => {
            const contents = generate(
                hmacConfig({
                    payloadFormat: { components: ["BODY"], delimiter: "", bodySort: undefined }
                })
            );
            expect(contents).toContain("string|null $requestBody");
            expect(contents).not.toContain("ksort");
            expect(contents).not.toContain("$requestBody === []");
        });
    });

    describe("behavior 2: runtime body-hash branch", () => {
        it("branches at runtime on the presence of the body-hash query parameter", () => {
            const contents = generate(
                hmacConfig({
                    signatureHeaderName: "x-twilio-signature",
                    algorithm: "SHA1",
                    encoding: "BASE64",
                    payloadFormat: {
                        components: ["NOTIFICATION_URL", "BODY"],
                        delimiter: "",
                        bodySort: "ALPHABETICAL"
                    },
                    bodyHashBinding: {
                        algorithm: "SHA256",
                        encoding: "HEX",
                        location: FernIr.WebhookBodyHashLocation.queryParameter({ name: "bodySHA256" })
                    }
                })
            );

            expect(contents).toContain(
                '$transmittedBodyHash = WebhookSignature::getWebhookQueryParameter($notificationUrl, "bodySHA256");'
            );
            expect(contents).toContain("if ($transmittedBodyHash !== null) {");
            // bodySort widens $requestBody; the JSON path narrows it to a string for hashing.
            expect(contents).toContain("$rawBody = is_string($requestBody) ? $requestBody : '';");
            expect(contents).toContain('$expectedBodyHash = WebhookSignature::computeHash($rawBody, "sha256", "hex");');
            expect(contents).toContain(
                "if (!WebhookSignature::timingSafeEqual($expectedBodyHash, $transmittedBodyHash)) {"
            );
            // JSON path: URL only.
            expect(contents).toContain("$payload = $notificationUrl;");
            // Body-hash check comes before the HMAC comparison.
            const bodyHashIdx = contents.indexOf("$expectedBodyHash");
            const hmacIdx = contents.indexOf("::computeHmacSignature(");
            expect(bodyHashIdx).toBeGreaterThan(-1);
            expect(hmacIdx).toBeGreaterThan(bodyHashIdx);
        });

        it("does not emit a body-hash block when bodyHashBinding is absent", () => {
            const contents = generate(
                hmacConfig({
                    payloadFormat: { components: ["BODY"], delimiter: "", bodySort: undefined }
                })
            );
            expect(contents).not.toContain("computeHash");
            expect(contents).not.toContain("getWebhookQueryParameter");
        });
    });

    describe("behavior 4: URL any-match normalization", () => {
        it("loops over notification-URL candidates when normalization is configured", () => {
            const contents = generate(twilioConfig({ portVariants: true, legacyQueryEncoding: true }));

            expect(contents).toContain(
                "$candidates = WebhookSignature::notificationUrlCandidates($notificationUrl, true, true);"
            );
            expect(contents).toContain("foreach ($candidates as $candidateUrl) {");
            expect(contents).toContain(
                '$payload = $transmittedBodyHash !== null ? $candidateUrl : implode("", [$candidateUrl, $bodyString]);'
            );
            expect(contents).toContain("if (WebhookSignature::timingSafeEqual($signature, $expected)) {");
            expect(contents).toContain("return true;");
            // Body-hash check runs once, above the loop.
            const bodyCheckIdx = contents.indexOf("$transmittedBodyHash = WebhookSignature::getWebhookQueryParameter");
            const loopIdx = contents.indexOf("foreach ($candidates");
            expect(bodyCheckIdx).toBeGreaterThan(-1);
            expect(loopIdx).toBeGreaterThan(bodyCheckIdx);
        });

        it("passes the configured normalization flags through", () => {
            const contents = generate(twilioConfig({ portVariants: true, legacyQueryEncoding: false }));
            expect(contents).toContain(
                "$candidates = WebhookSignature::notificationUrlCandidates($notificationUrl, true, false);"
            );
        });
    });
});

// A minimal PHP runtime harness: renders the shipped WebhookSignature core utility and the
// generated helper, then executes them under PHP (via a local binary or Docker) against
// known-good Twilio-style HMAC-SHA1 vectors. Skipped automatically when no PHP is available.
const CORE_TEMPLATE_PATH = join(__dirname, "..", "..", "..", "base", "src", "asIs", "WebhookSignature.Template.php");

function resolvePhpRunner(): { run: (dir: string, script: string) => string } | undefined {
    const tryLocal = (): boolean => {
        try {
            execFileSync("php", ["--version"], { stdio: "ignore" });
            return true;
        } catch {
            return false;
        }
    };
    if (tryLocal()) {
        return {
            run: (dir, script) => execFileSync("php", [join(dir, script)], { cwd: dir, encoding: "utf8" })
        };
    }
    const tryDocker = (): boolean => {
        try {
            execFileSync("docker", ["image", "inspect", "php:8.2-cli"], { stdio: "ignore" });
            return true;
        } catch {
            return false;
        }
    };
    if (tryDocker()) {
        return {
            run: (dir, script) =>
                execFileSync(
                    "docker",
                    ["run", "--rm", "-v", `${dir}:/app`, "-w", "/app", "php:8.2-cli", "php", script],
                    { encoding: "utf8" }
                )
        };
    }
    return undefined;
}

const phpRunner = resolvePhpRunner();
const runtimeDescribe = phpRunner != null && existsSync(CORE_TEMPLATE_PATH) ? describe : describe.skip;

runtimeDescribe("WebhooksHelper PHP runtime", () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const runner = phpRunner!;

    function materialize(verification: FernIr.WebhookSignatureVerification, script: string): string {
        const dir = mkdtempSync(join(tmpdir(), "php-webhook-"));
        try {
            const [helperFile] = new WebhooksHelperGenerator(
                buildContext(verification, { name: "smsStatus", pascal: "SmsStatus" })
            ).generate();
            // Drop the cross-namespace import so both classes live in a single flat namespace.
            const helperContents = (helperFile?.fileContents.toString() ?? "").replace(
                "use Seed\\Core\\WebhookSignature;",
                ""
            );

            const coreTemplate = readFileSync(CORE_TEMPLATE_PATH, "utf8");
            const core = coreTemplate.replace("namespace <%= namespace%>;", "namespace Seed;");

            writeFileSync(join(dir, "WebhookSignature.php"), core);
            writeFileSync(join(dir, "WebhooksHelper.php"), helperContents);
            writeFileSync(join(dir, script), buildScript());
            try {
                return runner.run(dir, script).trim();
            } catch (error) {
                // Surface PHP stdout/stderr so a failed assertion is legible in CI output.
                const e = error as { stdout?: Buffer | string; stderr?: Buffer | string };
                throw new Error(`PHP execution failed\nSTDOUT: ${e.stdout ?? ""}\nSTDERR: ${e.stderr ?? ""}`);
            }
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    }

    function buildScript(): string {
        return `<?php
require __DIR__ . '/WebhookSignature.php';
require __DIR__ . '/WebhooksHelper.php';
use Seed\\WebhooksHelper;
use Seed\\WebhookSignature;

$secret = 'twilio-secret';

// --- JSON path (body-hash query param present): sign the URL only ---
$body = '{"messageSid":"SM123","status":"delivered"}';
$bodyHash = WebhookSignature::computeHash($body, 'sha256', 'hex');
$url = 'https://example.com/webhooks/sms?bodySHA256=' . $bodyHash;
$sig = base64_encode(hash_hmac('sha1', $url, $secret, true));
assert(WebhooksHelper::verifySignature($body, $sig, $secret, $url) === true, 'json-valid');
assert(WebhooksHelper::verifySignature('{"tampered":true}', $sig, $secret, $url) === false, 'json-tampered-body');
assert(WebhooksHelper::verifySignature($body, $sig, 'wrong', $url) === false, 'json-wrong-secret');
assert(WebhooksHelper::verifySignature($body, base64_encode('nope'), $secret, $url) === false, 'json-tampered-hmac');

// --- Any-match normalization: signed with the standard :443 port present ---
$urlWithPort = 'https://example.com:443/webhooks/sms?bodySHA256=' . $bodyHash;
$sigWithPort = base64_encode(hash_hmac('sha1', $urlWithPort, $secret, true));
// caller passes the no-port URL; a candidate must reproduce the :443 form.
assert(WebhooksHelper::verifySignature($body, $sigWithPort, $secret, $url) === true, 'anymatch-port');

// --- Classic form path (no body-hash query param): sign URL + sorted/deduped params ---
$formUrl = 'https://example.com/webhooks/sms';
$params = ['Zebra' => '1', 'Apple' => ['b', 'a', 'a']]; // repeated + unsorted values
// expected bodyString: sorted keys (Apple, Zebra); Apple values deduped+sorted -> a,b
$expectedBodyString = 'Applea' . 'Appleb' . 'Zebra1';
$formSig = base64_encode(hash_hmac('sha1', $formUrl . $expectedBodyString, $secret, true));
assert(WebhooksHelper::verifySignature($params, $formSig, $secret, $formUrl) === true, 'form-multivalue');

// --- No-throw: null inputs return false, never raise ---
assert(WebhooksHelper::verifySignature(null, $sig, $secret, $url) === false, 'null-body');
assert(WebhooksHelper::verifySignature($body, null, $secret, $url) === false, 'null-sig');

// --- notificationUrlCandidates parity ---
// as-is + standard-port + no-port
$candidates = WebhookSignature::notificationUrlCandidates('https://example.com/hook?a=1', true, true);
assert(in_array('https://example.com/hook?a=1', $candidates, true), 'candidate-as-is');
assert(in_array('https://example.com:443/hook?a=1', $candidates, true), 'candidate-standard-port');
assert($candidates[0] === 'https://example.com/hook?a=1', 'candidate-order-first');

// http gets :80 as the standard port
$httpCandidates = WebhookSignature::notificationUrlCandidates('http://example.com/hook', true, false);
assert(in_array('http://example.com:80/hook', $httpCandidates, true), 'candidate-http-port');

// a URL that already carries a non-standard port yields a no-port form
$portedCandidates = WebhookSignature::notificationUrlCandidates('https://example.com:8443/hook', true, false);
assert(in_array('https://example.com/hook', $portedCandidates, true), 'candidate-no-port');
assert(in_array('https://example.com:8443/hook', $portedCandidates, true), 'candidate-keeps-port');

// legacy query re-encoding produces an additional candidate
$legacyCandidates = WebhookSignature::notificationUrlCandidates('https://example.com/hook?a=b%20c', true, true);
assert(in_array('https://example.com/hook?a=b+c', $legacyCandidates, true), 'candidate-legacy-query');

// disabling portVariants yields only the caller URL (+ legacy form if enabled)
$noVariants = WebhookSignature::notificationUrlCandidates('https://example.com/hook?a=1', false, false);
assert($noVariants === ['https://example.com/hook?a=1'], 'candidate-no-variants');

// unparseable URLs never throw and fall back to [$url]
$unparseable = WebhookSignature::notificationUrlCandidates('not-a-url', true, true);
assert($unparseable === ['not-a-url'], 'candidate-unparseable');

echo "OK\\n";
`;
    }

    it("verifies a known-good Twilio-style HMAC-SHA1 signature end-to-end", () => {
        const output = materialize(twilioConfig({ portVariants: true, legacyQueryEncoding: true }), "run.php");
        expect(output).toContain("OK");
    });
});
