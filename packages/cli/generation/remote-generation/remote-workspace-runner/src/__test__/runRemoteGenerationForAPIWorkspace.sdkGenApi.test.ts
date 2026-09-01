// cspell:ignore sdkgen
import { generatorsYml } from "@fern-api/configuration";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runGenerator = vi.hoisted(() => vi.fn());

vi.mock("../runRemoteGenerationForGenerator.js", () => ({
    runRemoteGenerationForGenerator: runGenerator
}));

import { FernSdkGenApiBatch } from "../fernSdkGenApi.js";
import type { FernSdkGenApiSourceArchive } from "../fernSdkGenApiSourceArchive.js";
import { runRemoteGenerationForAPIWorkspace } from "../runRemoteGenerationForAPIWorkspace.js";

function invocation(
    name: string,
    language: "typescript" | "python",
    version: string
): generatorsYml.GeneratorInvocation {
    return {
        name,
        version,
        language,
        config: {},
        keywords: [],
        smartCasing: true,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        outputMode: FernFiddle.OutputMode.downloadFiles({})
    } as never;
}

async function runMixedFailure(
    failure: "route" | "archive" | "post-barrier",
    { automation = true, remoteMutation = vi.fn() }: { automation?: boolean; remoteMutation?: () => void } = {}
): Promise<{
    typescript: generatorsYml.GeneratorInvocation;
    python: generatorsYml.GeneratorInvocation;
    recordSuccess: ReturnType<typeof vi.fn>;
    recordFailure: ReturnType<typeof vi.fn>;
    failWithoutThrowing: ReturnType<typeof vi.fn>;
}> {
    const typescript = invocation("fernapi/fern-typescript-sdk", "typescript", "3.999.999");
    const python = invocation("fernapi/fern-python-sdk", "python", failure === "route" ? "not-semver" : "5.999.999");
    const recordSuccess = vi.fn();
    const recordFailure = vi.fn();
    const failWithoutThrowing = vi.fn();
    runGenerator.mockImplementation(async (parameters) => {
        await parameters.sdkGenApiPreparationBatch.ready(parameters.sdkGenApiTargetIdSeed);
        if (failure === "post-barrier" && parameters.generatorInvocation.name === python.name) {
            throw new Error("post-barrier target failure");
        }
        remoteMutation();
        return {
            createdSnippets: false,
            snippetsS3PreSignedReadUrl: undefined,
            actualVersion: "1.2.3",
            pullRequestUrl: undefined,
            noChangesDetected: undefined,
            publishTarget: undefined
        };
    });
    const interactiveContext = {
        logger: { warn: vi.fn(), debug: vi.fn(), info: vi.fn() },
        failWithoutThrowing,
        getLastFailureMessage: vi.fn()
    };
    const context = {
        logger: { warn: vi.fn() },
        runInteractiveTask: async (_options: unknown, run: (taskContext: never) => Promise<void>) => {
            await run(interactiveContext as never);
            return true;
        }
    };
    const workspace = {
        workspaceName: "petstore",
        generatorsConfiguration: undefined,
        toFernWorkspace: vi.fn().mockResolvedValue({
            definition: { rootApiFile: { contents: { name: "Petstore" } } },
            cliVersion: "0.0.0"
        })
    };
    const sourceArchive: FernSdkGenApiSourceArchive = {
        buffer: Buffer.from("shared-archive"),
        manifest: { specs: [{ type: "openapi", specPath: "/fern/specs/openapi0.json" }] },
        specIndexes: [0]
    };

    await runRemoteGenerationForAPIWorkspace({
        projectConfig: { organization: "acme" } as never,
        organization: "acme",
        workspace: workspace as never,
        context: context as never,
        generatorGroup: {
            groupName: "sdk",
            generators: [typescript, python],
            audiences: { type: "all" }
        } as never,
        version: "1.2.3",
        shouldLogS3Url: false,
        token: { value: "token" } as never,
        whitelabel: undefined,
        replay: undefined,
        absolutePathToPreview: undefined,
        mode: undefined,
        fernignorePath: undefined,
        skipFernignore: true,
        dynamicIrOnly: false,
        validateWorkspace: false,
        retryRateLimited: false,
        requireEnvVars: true,
        automation: automation ? ({ recorder: { recordSuccess, recordFailure } } as never) : undefined,
        getSpecsTarGzBuffer: async (requests) => ({
            sourceArchives: new Map(
                requests
                    .filter((request) => failure !== "archive" || request.generatorIndex !== 1)
                    .map((request) => [request.generatorIndex, sourceArchive])
            ),
            errors: new Map(
                failure === "archive" ? [[1, new Error("target source override could not be resolved")]] : []
            )
        })
    });

    return { typescript, python, recordSuccess, recordFailure, failWithoutThrowing };
}

describe("runRemoteGenerationForAPIWorkspace sdk-gen-api preparation", () => {
    beforeEach(() => {
        vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
        runGenerator.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([
        "route",
        "archive"
    ] as const)("records a target %s failure without canceling its valid automation sibling", async (failure) => {
        const result = await runMixedFailure(failure);

        expect(runGenerator).toHaveBeenCalledTimes(1);
        expect(result.recordSuccess).toHaveBeenCalledTimes(1);
        expect(result.recordSuccess).toHaveBeenCalledWith(
            expect.objectContaining({ generatorName: result.typescript.name })
        );
        expect(result.recordFailure).toHaveBeenCalledTimes(1);
        expect(result.recordFailure).toHaveBeenCalledWith(
            expect.objectContaining({ generatorName: result.python.name })
        );
        expect(result.failWithoutThrowing).toHaveBeenCalledTimes(1);
    });

    it("fails a legacy cutover target before source preparation or target work", async () => {
        const getSpecsTarGzBuffer = vi.fn();
        const runInteractiveTask = vi.fn();

        await expect(
            runRemoteGenerationForAPIWorkspace({
                projectConfig: { organization: "acme" } as never,
                organization: "acme",
                workspace: {
                    workspaceName: "petstore",
                    generatorsConfiguration: undefined
                } as never,
                context: { logger: { warn: vi.fn() }, runInteractiveTask } as never,
                generatorGroup: {
                    groupName: "sdk",
                    generators: [
                        invocation("fernapi/fern-typescript-sdk", "typescript", "4.0.0"),
                        invocation("fernapi/fern-python-sdk", "python", "5.999.999")
                    ],
                    audiences: { type: "all" }
                } as never,
                version: "1.2.3",
                shouldLogS3Url: false,
                token: { value: "token" } as never,
                whitelabel: undefined,
                replay: undefined,
                absolutePathToPreview: undefined,
                mode: undefined,
                fernignorePath: undefined,
                skipFernignore: true,
                dynamicIrOnly: false,
                validateWorkspace: false,
                retryRateLimited: false,
                requireEnvVars: true,
                getSpecsTarGzBuffer
            })
        ).rejects.toThrow("fern sdk migrate --output <path>");
        expect(getSpecsTarGzBuffer).not.toHaveBeenCalled();
        expect(runInteractiveTask).not.toHaveBeenCalled();
    });

    it("removes a post-barrier automation failure without cancelling valid undispatched siblings", async () => {
        const remove = vi.spyOn(FernSdkGenApiBatch.prototype, "remove");
        const cancel = vi.spyOn(FernSdkGenApiBatch.prototype, "cancel");

        const result = await runMixedFailure("post-barrier");

        expect(result.recordSuccess).toHaveBeenCalledTimes(1);
        expect(result.recordFailure).toHaveBeenCalledTimes(1);
        expect(remove).toHaveBeenCalledWith("1", expect.objectContaining({ message: "post-barrier target failure" }));
        expect(cancel).not.toHaveBeenCalled();
    });

    it("cancels the batch for a post-barrier non-automation failure", async () => {
        const cancel = vi.spyOn(FernSdkGenApiBatch.prototype, "cancel");

        await expect(runMixedFailure("post-barrier", { automation: false })).rejects.toThrow(
            "post-barrier target failure"
        );
        expect(cancel).toHaveBeenCalledWith(expect.objectContaining({ message: "post-barrier target failure" }));
    });
});
