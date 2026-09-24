import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd } from "@fern-api/fs-utils";
import type {
    FernSdkConfigV1Payload,
    FernSdkGenApiPackageConfig,
    FernSdkGenApiRequestedOutput
} from "@fern-api/remote-workspace-runner";
import { validateFernSdkGenApiPublishTargets } from "@fern-api/remote-workspace-runner/direct-publish-credentials";
import { parseSdkConfigV1, type SdkConfigV1, validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import YAML from "yaml";

import { getDuplicateTargetLanguageIndexes } from "./getDuplicateTargetLanguageIndexes.js";
import { getSdkConfigGeneratorName } from "./sdkConfigGeneratorName.js";
import {
    resolveSdkConfigPublishCredential,
    sanitizeSdkConfigPublishCredentials
} from "./sdkConfigPublishCredentials.js";

export interface LoadedSdkConfigV1 {
    absolutePath: string;
    config: SdkConfigV1;
    payload: FernSdkConfigV1Payload;
}

interface SdkConfigTargetSelection {
    generatorName?: string;
    generatorIndex?: number;
}

/** Reads and validates a customer SDK Config YAML or JSON document for SDK Generation API transport. */
export async function loadSdkConfigV1(
    configPath: string,
    isPreview = false,
    selection: SdkConfigTargetSelection = {}
): Promise<LoadedSdkConfigV1> {
    const absolutePath = resolve(cwd(), configPath);
    const body = await readFile(absolutePath);
    let input: unknown;
    try {
        input = YAML.parse(body.toString("utf8"));
    } catch (error) {
        throw new Error(
            `SDK Config v1 at ${absolutePath} is not valid YAML: ${error instanceof Error ? error.message : String(error)}`
        );
    }

    try {
        const { sanitizedInput, credentials } = sanitizeSdkConfigPublishCredentials(input, isPreview);
        const { document, parsed } = validateAndParseSdkConfigV1(sanitizedInput);
        if (document.targets.length !== credentials.length || parsed.targets.length !== credentials.length) {
            throw new Error("SDK Config v1 target count changed during validation");
        }
        const duplicateTargetLanguageIndexes = getDuplicateTargetLanguageIndexes(parsed.targets);
        const selectedTargetIndexes = getSelectedTargetIndexes(parsed, selection, isPreview);
        const payload: FernSdkConfigV1Payload = {
            sdkName: parsed.sdkName,
            sdkVersion: parsed.sdkVersion,
            ...(parsed.apiVersion != null ? { apiVersion: parsed.apiVersion } : {}),
            ...(parsed.api.audiences != null ? { audiences: parsed.api.audiences } : {}),
            ...(parsed.client.pathParameterStyle != null
                ? { clientPathParameterStyle: parsed.client.pathParameterStyle }
                : {}),
            targets: parsed.targets.map((target, index) => {
                const documentTarget = document.targets[index];
                if (documentTarget == null) {
                    throw new Error(`SDK Config v1 target ${index} is missing after validation`);
                }
                const output = target.output ?? parsed.output;
                const duplicateTargetLanguageIndex = duplicateTargetLanguageIndexes[index];
                return {
                    body: Buffer.from(`${JSON.stringify({ ...document, targets: [documentTarget] })}\n`),
                    language: target.language,
                    ...(target.generatorVersion != null ? { generatorVersion: target.generatorVersion } : {}),
                    ...(target.sdkName != null ? { sdkName: target.sdkName } : {}),
                    ...(target.sdkVersion != null ? { sdkVersion: target.sdkVersion } : {}),
                    ...(target.client?.pathParameterStyle != null
                        ? { clientPathParameterStyle: target.client.pathParameterStyle }
                        : {}),
                    requestedOutput: toRequestedOutput(output, isPreview),
                    ...(output?.delivery === "zip"
                        ? {
                              absolutePathToLocalOutputArchive: AbsoluteFilePath.of(
                                  resolve(
                                      dirname(absolutePath),
                                      output.fileName ??
                                          `generated/${target.language}${duplicateTargetLanguageIndex == null ? "" : `-${duplicateTargetLanguageIndex}`}.zip`
                                  )
                              )
                          }
                        : {}),
                    package: { ...parsed.package, ...target.package } satisfies FernSdkGenApiPackageConfig,
                    ...(credentials[index] == null || !selectedTargetIndexes.has(index)
                        ? {}
                        : { publishCredential: resolveSdkConfigPublishCredential(credentials[index]) })
                };
            })
        };
        validateFernSdkGenApiPublishTargets(
            payload.targets.flatMap((target, index) =>
                selectedTargetIndexes.has(index)
                    ? [
                          {
                              publicationRequested:
                                  target.requestedOutput?.type === "publish" ||
                                  (target.requestedOutput?.type === "github" && target.requestedOutput.publish != null),
                              credentialsRequired: target.requestedOutput?.type === "publish",
                              ...publicationValidationMetadata(target.requestedOutput),
                              ...(target.publishCredential == null
                                  ? {}
                                  : { publishCredential: target.publishCredential })
                          }
                      ]
                    : []
            )
        );
        return {
            absolutePath,
            config: parsed,
            payload
        };
    } catch (error) {
        throw new Error(
            `SDK Config v1 at ${absolutePath} failed validation: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error }
        );
    }
}

function getSelectedTargetIndexes(
    config: SdkConfigV1,
    selection: SdkConfigTargetSelection,
    isPreview: boolean
): Set<number> {
    if (isPreview) {
        return new Set();
    }
    if (selection.generatorIndex != null) {
        if (selection.generatorIndex < 0 || selection.generatorIndex >= config.targets.length) {
            throw new Error(
                `Generator index ${selection.generatorIndex} is out of range for SDK Config v1 targets (expected 0-${config.targets.length - 1})`
            );
        }
        return new Set([selection.generatorIndex]);
    }
    if (selection.generatorName != null) {
        return new Set(
            config.targets.flatMap((target, index) =>
                getSdkConfigGeneratorName(target.language) === selection.generatorName ? [index] : []
            )
        );
    }
    return new Set(config.targets.map((_, index) => index));
}

function validateAndParseSdkConfigV1(input: unknown): {
    document: ReturnType<typeof validateSdkConfigV1>;
    parsed: SdkConfigV1;
} {
    if (!isRecord(input) || !Array.isArray(input.targets)) {
        const document = validateSdkConfigV1(input);
        return { document, parsed: parseSdkConfigV1(document) };
    }
    const documents = input.targets.map((target) => validateSdkConfigV1({ ...input, targets: [target] }));
    const parsedDocuments = documents.map((document) => parseSdkConfigV1(document));
    const firstDocument = documents[0];
    const firstParsed = parsedDocuments[0];
    if (firstDocument == null || firstParsed == null) {
        const document = validateSdkConfigV1(input);
        return { document, parsed: parseSdkConfigV1(document) };
    }
    const documentTargets = documents.map((document, index) => requireSingleTarget(document.targets, index));
    const parsedTargets = parsedDocuments.map((document, index) => requireSingleTarget(document.targets, index));
    return {
        document: {
            ...firstDocument,
            targets: documentTargets
        },
        parsed: {
            ...firstParsed,
            targets: parsedTargets
        }
    };
}

function requireSingleTarget<T>(targets: T[], index: number): T {
    const target = targets[0];
    if (targets.length !== 1 || target == null) {
        throw new Error(`SDK Config v1 target ${index} did not survive validation exactly once`);
    }
    return target;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function publicationValidationMetadata(requestedOutput: FernSdkGenApiRequestedOutput | undefined): {
    publishRegistry?: string;
    publishUrl?: string;
} {
    const publish =
        requestedOutput?.type === "publish" || requestedOutput?.type === "github" ? requestedOutput.publish : undefined;
    return publish == null
        ? {}
        : {
              publishRegistry: publish.registry,
              ...(publish.url == null ? {} : { publishUrl: publish.url })
          };
}

function toRequestedOutput(output: SdkConfigV1["output"], isPreview: boolean): FernSdkGenApiRequestedOutput {
    if (isPreview) {
        return { type: "download" };
    }
    if (output == null || output.delivery === "files" || output.delivery === "zip") {
        return output?.publish == null ? { type: "download" } : { type: "publish", publish: output.publish };
    }
    return {
        type: "github",
        repository: output.github.repository,
        ...(output.github.host == null ? {} : { host: output.github.host }),
        ...(output.github.branch == null ? {} : { branch: output.github.branch }),
        ...(output.github.mode == null ? {} : { mode: toRequestedGithubMode(output.github.mode) }),
        ...(output.github.reviewers == null ? {} : { reviewers: output.github.reviewers }),
        ...(output.publish == null ? {} : { publish: output.publish })
    };
}

function toRequestedGithubMode(
    mode: "release" | "pull-request" | "push" | "commit" | "commit-and-release"
): "release" | "pull-request" | "push" {
    switch (mode) {
        case "release":
        case "pull-request":
            return mode;
        case "push":
        case "commit":
            return "push";
        case "commit-and-release":
            return "release";
        default:
            assertNever(mode);
    }
}
