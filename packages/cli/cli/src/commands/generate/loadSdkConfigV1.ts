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

import { sanitizeSdkConfigPublishCredentials } from "./sdkConfigPublishCredentials.js";

export interface LoadedSdkConfigV1 {
    absolutePath: string;
    config: SdkConfigV1;
    payload: FernSdkConfigV1Payload;
}

/** Reads and validates a customer SDK Config YAML or JSON document for SDK Generation API transport. */
export async function loadSdkConfigV1(configPath: string, isPreview = false): Promise<LoadedSdkConfigV1> {
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
                                      output.fileName ?? `generated/${target.language}.zip`
                                  )
                              )
                          }
                        : {}),
                    package: { ...parsed.package, ...target.package } satisfies FernSdkGenApiPackageConfig,
                    ...(isPreview || credentials[index] == null
                        ? {}
                        : { publishCredential: credentials[index] })
                };
            })
        };
        validateFernSdkGenApiPublishTargets(
            payload.targets.map((target) => ({
                publicationRequested:
                    target.requestedOutput?.type === "publish" ||
                    (target.requestedOutput?.type === "github" && target.requestedOutput.publish != null),
                credentialsRequired: target.requestedOutput?.type === "publish",
                ...publicationValidationMetadata(target.requestedOutput),
                ...(target.publishCredential == null ? {} : { publishCredential: target.publishCredential })
            }))
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

function validateAndParseSdkConfigV1(input: unknown): {
    document: ReturnType<typeof validateSdkConfigV1>;
    parsed: SdkConfigV1;
} {
    if (!hasDuplicateTargetLanguages(input)) {
        const document = validateSdkConfigV1(input);
        return { document, parsed: parseSdkConfigV1(document) };
    }
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
    return {
        document: {
            ...firstDocument,
            targets: documents.flatMap((document) => (document.targets[0] == null ? [] : [document.targets[0]]))
        },
        parsed: {
            ...firstParsed,
            targets: parsedDocuments.flatMap((document) =>
                document.targets[0] == null ? [] : [document.targets[0]]
            )
        }
    };
}

function hasDuplicateTargetLanguages(input: unknown): boolean {
    if (!isRecord(input) || !Array.isArray(input.targets)) {
        return false;
    }
    const languages = input.targets.flatMap((target) =>
        isRecord(target) && typeof target.language === "string" ? [target.language] : []
    );
    return new Set(languages).size !== languages.length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function publicationValidationMetadata(
    requestedOutput: FernSdkGenApiRequestedOutput | undefined
): { publishRegistry?: string; publishUrl?: string } {
    const publish =
        requestedOutput?.type === "publish" || requestedOutput?.type === "github"
            ? requestedOutput.publish
            : undefined;
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
