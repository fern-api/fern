import type { FernDefinition, FernWorkspace } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration-loader";
import {
    type FernConfigMappingDiagnostic,
    type FernResolvedGeneratorGroupInput,
    type FernResolvedGeneratorInput,
    mapFernConfigToSdkConfigV1,
    parseSdkConfigV1,
    type SdkConfigV1ApiConfigInput
} from "@postman/sdk-config/sdk-config/v1";

export interface MappingResult {
    diagnostics: FernConfigMappingDiagnostic[];
    sdkConfig: ReturnType<typeof parseSdkConfigV1>;
}

export function mapFernGroupToSdkConfig({
    fernWorkspace,
    group
}: {
    fernWorkspace: Pick<FernWorkspace, "definition">;
    group: generatorsYml.GeneratorGroup;
}): MappingResult {
    const apiProjection = mapFernDefinitionToSdkConfigApi(fernWorkspace.definition);
    const input: FernResolvedGeneratorGroupInput = {
        apiName: fernWorkspace.definition.rootApiFile.contents.name,
        apiVersion: fernWorkspace.definition.specVersion,
        api: apiProjection.api,
        group: {
            name: group.groupName,
            audiences: group.audiences,
            generators: group.generators.map(normalizeGeneratorForMapping)
        }
    };
    const mapped = mapFernConfigToSdkConfigV1(input);
    return {
        diagnostics: [...apiProjection.diagnostics, ...mapped.unsupportedFields],
        sdkConfig: parseSdkConfigV1(mapped.sdkConfig)
    };
}

export function mapFernDefinitionToSdkConfigApi(definition: FernDefinition): {
    api: SdkConfigV1ApiConfigInput;
    diagnostics: FernConfigMappingDiagnostic[];
} {
    const root = definition.rootApiFile.contents;
    const environments = Object.entries(root.environments ?? {}).map(([name, environment]) => ({
        name,
        urls: mapEnvironmentUrls(environment),
        ...(typeof environment === "string" || environment.docs == null ? {} : { description: environment.docs })
    }));
    const headers = Object.entries(root.headers ?? {}).map(([headerName, header]) =>
        typeof header === "string"
            ? { name: headerName }
            : {
                  name: header.name ?? headerName,
                  ...(header.env == null ? {} : { environmentVariable: header.env }),
                  ...(header.docs == null ? {} : { description: header.docs })
              }
    );
    const diagnostics: FernConfigMappingDiagnostic[] = [];
    if (root.auth != null || root["auth-schemes"] != null) {
        diagnostics.push({
            code: "FERN_API_AUTH_REQUIRES_REVIEW",
            severity: "warning",
            path: ["api", "auth"],
            reason: "Fern API authentication cannot yet be represented safely by this migration command",
            sdkConfigPath: ["api", "auth"],
            suggestedAction: "Review the Fern auth schemes and configure api.auth manually in SDK Config v1."
        });
    }
    const baseUrl = root["default-url"] ?? definition.rootApiFile.defaultUrl;
    return {
        api: {
            ...(baseUrl == null ? {} : { baseUrl }),
            ...(root["default-environment"] == null ? {} : { defaultEnvironment: root["default-environment"] }),
            ...(environments.length === 0 ? {} : { environments }),
            ...(headers.length === 0 ? {} : { headers })
        },
        diagnostics
    };
}

function mapEnvironmentUrls(
    environment: NonNullable<FernDefinition["rootApiFile"]["contents"]["environments"]>[string]
): Array<{ name: string; url: string }> {
    if (typeof environment === "string") {
        return [{ name: "default", url: environment }];
    }
    if ("url" in environment) {
        return [{ name: "default", url: environment.url }];
    }
    return Object.entries(environment.urls).map(([name, url]) => ({ name, url }));
}

function normalizeGeneratorForMapping(generator: generatorsYml.GeneratorInvocation): FernResolvedGeneratorInput {
    return {
        ...generator,
        outputMode: normalizeResolvedOutput(generator.outputMode)
    };
}

function normalizeResolvedOutput(value: unknown, fieldName?: string): unknown {
    if (fieldName === "coordinate" && typeof value === "string") {
        return value
            .split(":")
            .map((part) => part.trim())
            .join(":");
    }
    if (Array.isArray(value)) {
        return value.map((item) => normalizeResolvedOutput(item));
    }
    if (!isRecord(value)) {
        return value;
    }
    return Object.fromEntries(
        Object.entries(value).flatMap(([key, child]) => {
            if (key === "_visit" || isEmptyCredential(key, child) || (key === "downloadSnippets" && child === false)) {
                return [];
            }
            return [[key, normalizeResolvedOutput(child, key)]];
        })
    );
}

function isEmptyCredential(fieldName: string, value: unknown): boolean {
    return value === "" && ["apiKey", "password", "token", "username"].includes(fieldName);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}
