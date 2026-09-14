import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cwd } from "@fern-api/fs-utils";
import type { FernSdkConfigV1Payload } from "@fern-api/remote-workspace-runner";
import { parseSdkConfigV1, validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import YAML from "yaml";

export interface LoadedSdkConfigV1 {
    absolutePath: string;
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
                targets: parsed.targets.map((target) => ({
                    language: target.language,
                    ...(target.generatorVersion != null ? { generatorVersion: target.generatorVersion } : {}),
                    ...(target.sdkName != null ? { sdkName: target.sdkName } : {}),
                    ...(target.sdkVersion != null ? { sdkVersion: target.sdkVersion } : {}),
                    ...(target.client?.pathParameterStyle != null
                        ? { clientPathParameterStyle: target.client.pathParameterStyle }
                        : {})
                }))
            }
        };
    } catch (error) {
        throw new Error(
            `SDK Config v1 at ${absolutePath} failed validation: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error }
        );
    }
}
