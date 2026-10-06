import { generatorsYml } from "@fern-api/configuration";
import { loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import type { APIV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { CliError, createMockTaskContext } from "@fern-api/task-context";
import type { FernWorkspace } from "@fern-api/workspace-loader";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@fern-api/ir-generator", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/ir-generator")>()),
    generateIntermediateRepresentation: vi.fn(({ generationLanguage }: { generationLanguage: string }) => {
        if (generationLanguage === "python") {
            throw new CliError({
                message: 'Example is not an object. Got: "Unauthorized"',
                code: CliError.Code.ValidationError
            });
        }
        return { generationLanguage };
    }),
    convertIrToDynamicSnippetsIr: vi.fn(({ generationLanguage }: { generationLanguage: string }) => ({
        generationLanguage
    }))
}));

import { generateLanguageSpecificDynamicIRs } from "../publishDocs.js";

const FIXTURE = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of("fixtures/github-only-snippets/fern/apis/voice")
);

describe("generateLanguageSpecificDynamicIRs", () => {
    let workspace: FernWorkspace;

    beforeAll(async () => {
        const generatorsConfiguration = await loadGeneratorsConfiguration({
            absolutePathToWorkspace: FIXTURE,
            context: createMockTaskContext()
        });
        workspace = asWorkspace("voice", generatorsConfiguration);
    });

    it("skips a language whose dynamic IR fails to build and keeps the other languages", async () => {
        const warnings: string[] = [];
        const context = createMockTaskContext({
            logger: createLogger((level, ...args) => {
                if (level === LogLevel.Warn) {
                    warnings.push(args.join(" "));
                }
            })
        });
        const snippetsConfig: APIV1Write.SnippetsConfig = {
            pythonSdk: { package: "smallestai" },
            typescriptSdk: { package: "smallestai" }
        };

        const result = await generateLanguageSpecificDynamicIRs({
            workspace,
            apiWorkspaces: [],
            organization: "smallest-ai",
            context,
            snippetsConfig
        });

        expect(Object.keys(result ?? {})).toEqual(["typescript"]);
        expect(
            warnings.some((line) => line.includes("Skipping python SDK snippets") && line.includes("Unauthorized"))
        ).toBe(true);
        expect(warnings.some((line) => line.includes("Failed to upload python SDK snippets"))).toBe(false);
    });
});

function asWorkspace(
    workspaceName: string,
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined
): FernWorkspace {
    // Only the fields generateLanguageSpecificDynamicIRs reads are needed; IR generation is mocked.
    return { workspaceName, generatorsConfiguration } as unknown as FernWorkspace;
}
