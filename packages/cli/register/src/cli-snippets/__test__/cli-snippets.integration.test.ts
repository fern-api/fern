/**
 * End-to-end fixture test for publish-time CLI-snippet injection.
 *
 * Builds real FDR examples from a Twilio-shaped OpenAPI fixture (via the same
 * loadAPIWorkspace -> IR -> convertIrToFdrApi pipeline publishing uses), then runs the
 * injection against a committed fixture catalog and asserts a coverage count plus the shape
 * of the assembled commands. The coverage count is the guard the plan calls for: a silent
 * path-reconstruction or wire-name-join regression shows up here as matched < total.
 *
 * The committed catalog is hand-authored to match what the CLI SDK runtime's `--schema` would
 * emit for this fixture (command names + kebab flags). The separate cargo-gated e2e
 * (cli-snippets.dryrun.e2e.test.ts) regenerates it from a real binary and runs `--dry-run`.
 */

import { readFileSync } from "node:fs";
import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import assert from "assert";
import { beforeAll, describe, expect, it } from "vitest";
import { convertIrToFdrApi } from "../../ir-to-fdr-converter/convertIrToFdrApi.js";
import { parseCliCatalog } from "../catalog.js";
import {
    CLI_SNIPPET_LANGUAGE,
    injectCliSnippetsIntoApiDefinition,
    reconstructOpenApiPath
} from "../injectCliSnippets.js";

type ApiDefinition = FdrCjsSdk.api.v1.register.ApiDefinition;
type EndpointDefinition = FdrCjsSdk.api.v1.register.EndpointDefinition;

const FIXTURE = "fixtures/twilio-like";

function allEndpoints(api: ApiDefinition): EndpointDefinition[] {
    return [...api.rootPackage.endpoints, ...Object.values(api.subpackages).flatMap((pkg) => pkg.endpoints)];
}

function cliCodeFor(api: ApiDefinition, method: string): string | undefined {
    const endpoint = allEndpoints(api).find((e) => e.method === method);
    const example = endpoint?.examples[0];
    return (example?.codeSamples ?? []).find((s) => s.language === CLI_SNIPPET_LANGUAGE)?.code;
}

/** Tokens that start with `--` (the emitted flags), in order. */
function flagsOf(command: string): string[] {
    return command.split(/\s+/).filter((token) => token.startsWith("--"));
}

describe("CLI snippet injection (twilio-like fixture)", () => {
    let api: ApiDefinition;
    let stats: ReturnType<typeof injectCliSnippetsIntoApiDefinition>;

    beforeAll(async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of(FIXTURE)),
            context,
            cliVersion: "0.0.0",
            workspaceName: "twilio-like"
        });
        assert(workspace.didSucceed);
        assert(workspace.workspace instanceof OSSWorkspace);

        const ir = await workspace.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: false
        });

        api = convertIrToFdrApi({
            ir,
            snippetsConfig: {
                typescriptSdk: undefined,
                pythonSdk: undefined,
                javaSdk: undefined,
                rubySdk: undefined,
                goSdk: undefined,
                csharpSdk: undefined,
                phpSdk: undefined,
                swiftSdk: undefined,
                rustSdk: undefined
            },
            playgroundConfig: { oauth: true },
            context
        });

        const catalog = parseCliCatalog(
            JSON.parse(
                readFileSync(
                    join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of(`${FIXTURE}/cli-catalog.json`)),
                    "utf-8"
                )
            )
        );
        stats = injectCliSnippetsIntoApiDefinition({ apiDefinition: api, catalog, context });
    });

    it("reconstructs the {AccountSid}/.json path and matches every catalog endpoint (coverage guard)", () => {
        // Both operations on the fixture path must join to a catalog command.
        expect(stats.totalEndpoints).toBe(2);
        expect(stats.matchedEndpoints).toBe(2);
        expect(stats.injectedSamples).toBeGreaterThanOrEqual(2);
        // Sanity-check the reconstruction directly against the catalog's path string.
        const paths = allEndpoints(api).map((e) => reconstructOpenApiPath(e.path));
        expect(paths).toContain("/2010-04-01/Accounts/{AccountSid}/Messages.json");
    });

    it("assembles the POST command with the path param + body flags from the catalog", () => {
        const code = cliCodeFor(api, "POST");
        expect(code).toBeDefined();
        assert(code != null);
        expect(code.startsWith("twilio core messages create ")).toBe(true);
        // Path-param value is read from the FDR example by the AccountSid wire name.
        expect(code).toContain("--account-sid AC0000000000000000000000000000");
        expect(code).toContain("--to ");
        // Flags are emitted in catalog order; required path flag comes first.
        expect(flagsOf(code)[0]).toBe("--account-sid");
        expect(flagsOf(code)).toContain("--to");
    });

    it("assembles the GET command with the query flag", () => {
        const code = cliCodeFor(api, "GET");
        expect(code).toBeDefined();
        assert(code != null);
        expect(code.startsWith("twilio core messages list ")).toBe(true);
        expect(flagsOf(code)).toContain("--account-sid");
        expect(flagsOf(code)).toContain("--page-size");
    });

    it("is idempotent: re-running injection does not add a second cli sample", () => {
        injectCliSnippetsIntoApiDefinition({
            apiDefinition: api,
            catalog: parseCliCatalog(
                JSON.parse(
                    readFileSync(
                        join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of(`${FIXTURE}/cli-catalog.json`)),
                        "utf-8"
                    )
                )
            )
        });
        for (const endpoint of allEndpoints(api)) {
            for (const example of endpoint.examples) {
                const cliSamples = (example.codeSamples ?? []).filter((s) => s.language === CLI_SNIPPET_LANGUAGE);
                expect(cliSamples.length).toBeLessThanOrEqual(1);
            }
        }
    });
});
