import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { AbsoluteFilePath, cwd } from "@fern-api/fs-utils";
import type {
    FernSdkConfigV1Payload,
    FernSdkGenApiPackageConfig,
    FernSdkGenApiRequestedOutput
} from "@fern-api/remote-workspace-runner";
import { parseSdkConfigV1, type SdkConfigV1, validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import YAML from "yaml";

export interface LoadedSdkConfigV1 {
    absolutePath: string;
    config: SdkConfigV1;
    payload: FernSdkConfigV1Payload;
}

/** Reads and validates a customer SDK Config YAML or JSON document for SDK Generation API transport. */
export async function loadSdkConfigV1(configPath: string): Promise<LoadedSdkConfigV1> {
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
        const document = validateSdkConfigV1(input);
        const parsed = parseSdkConfigV1(document);
        return {
            absolutePath,
            config: parsed,
            payload: {
                // The SDK Generation API wire contract is JSON even though the customer-facing
                // document convention is YAML.
                body: Buffer.from(`${JSON.stringify(document)}\n`),
                sdkName: parsed.sdkName,
                sdkVersion: parsed.sdkVersion,
                ...(parsed.apiVersion != null ? { apiVersion: parsed.apiVersion } : {}),
                ...(parsed.api.audiences != null ? { audiences: parsed.api.audiences } : {}),
                ...(parsed.client.pathParameterStyle != null
                    ? { clientPathParameterStyle: parsed.client.pathParameterStyle }
                    : {}),
                targets: parsed.targets.map((target) => {
                    const output = target.output ?? parsed.output;
                    return {
                        language: target.language,
                        ...(target.generatorVersion != null ? { generatorVersion: target.generatorVersion } : {}),
                        ...(target.sdkName != null ? { sdkName: target.sdkName } : {}),
                        ...(target.sdkVersion != null ? { sdkVersion: target.sdkVersion } : {}),
                        ...(target.client?.pathParameterStyle != null
                            ? { clientPathParameterStyle: target.client.pathParameterStyle }
                            : {}),
                        requestedOutput: toRequestedOutput(output),
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
                        package: { ...parsed.package, ...target.package } satisfies FernSdkGenApiPackageConfig
                    };
                })
            }
        };
    } catch (error) {
        throw new Error(
            `SDK Config v1 at ${absolutePath} failed validation: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error }
        );
    }
}

function toRequestedOutput(output: SdkConfigV1["output"]): FernSdkGenApiRequestedOutput {
    if (output == null || output.delivery === "files" || output.delivery === "zip") {
        return { type: "download" };
    }
    return {
        type: "github",
        repository: output.github.repository,
        ...(output.github.host == null ? {} : { host: output.github.host }),
        ...(output.github.branch == null ? {} : { branch: output.github.branch }),
        ...(output.github.mode == null ? {} : { mode: output.github.mode }),
        ...(output.github.reviewers == null ? {} : { reviewers: output.github.reviewers }),
        ...(output.publish == null ? {} : { publish: output.publish })
    };
}
