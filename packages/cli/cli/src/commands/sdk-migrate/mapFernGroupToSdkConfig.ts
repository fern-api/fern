import type { FernDefinition, FernWorkspace } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration-loader";
import { type RawSchemas, visitRawApiAuth, visitRawAuthSchemeDeclaration } from "@fern-api/fern-definition-schema";
import {
    type FernConfigMappingDiagnostic,
    type FernResolvedGeneratorGroupInput,
    type FernResolvedGeneratorInput,
    mapFernConfigToSdkConfigV1,
    type SdkConfigV1ApiConfigInput,
    type SdkConfigV1SourceConfig,
    validateSdkConfigV1
} from "@postman/sdk-config/sdk-config/v1";

import type { SourceDerivedApiFields } from "./projectMigrationSource.js";

export interface MappingResult {
    diagnostics: FernConfigMappingDiagnostic[];
    sdkConfig: ReturnType<typeof validateSdkConfigV1>;
}

export function mapFernGroupToSdkConfig({
    fernWorkspace,
    group,
    source,
    clientPathParameterStyle,
    sourceDerivedApiFields
}: {
    fernWorkspace: Pick<FernWorkspace, "definition">;
    group: generatorsYml.GeneratorGroup;
    source: SdkConfigV1SourceConfig;
    clientPathParameterStyle?: "inline" | "wrapped";
    sourceDerivedApiFields?: SourceDerivedApiFields;
}): MappingResult {
    const apiProjection = mapFernDefinitionToSdkConfigApi(fernWorkspace.definition, sourceDerivedApiFields);
    const input: FernResolvedGeneratorGroupInput = {
        apiName: fernWorkspace.definition.rootApiFile.contents.name,
        source,
        api: apiProjection.api,
        group: {
            name: group.groupName,
            audiences: group.audiences,
            generators: group.generators.map(normalizeGeneratorForMapping)
        }
    };
    const mapped = mapFernConfigToSdkConfigV1(input);
    const sdkConfig =
        clientPathParameterStyle == null || mapped.sdkConfig.client?.pathParameterStyle != null
            ? mapped.sdkConfig
            : {
                  ...mapped.sdkConfig,
                  client: {
                      ...(mapped.sdkConfig.client ?? {}),
                      pathParameterStyle: clientPathParameterStyle
                  }
              };
    const validated = validateSdkConfigV1(sdkConfig);
    const migrationCredentials = group.generators.map((generator, index) =>
        migratePublishCredentials(generator.outputMode, index)
    );
    return {
        diagnostics: [
            ...apiProjection.diagnostics,
            ...mapped.unsupportedFields.filter((diagnostic) => !isPublishCredentialDiagnostic(diagnostic)),
            ...migrationCredentials.flatMap((result) => result.diagnostics)
        ],
        sdkConfig: {
            ...validated,
            targets: validated.targets.map((target, index) => {
                const credentials = migrationCredentials[index]?.credentials;
                if (target.output?.publish == null) {
                    return target;
                }
                const publish = sanitizeMigratedPublishIntent(target.output.publish);
                return {
                    ...target,
                    output: {
                        ...target.output,
                        publish: { ...publish, ...credentials }
                    }
                };
            })
        }
    };
}

function sanitizeMigratedPublishIntent<
    Publish extends {
        registry: string;
        credentials?: unknown;
        token?: unknown;
        username?: unknown;
        password?: unknown;
        signature?: unknown;
    }
>(value: Publish): Omit<Publish, "credentials" | "token" | "username" | "password" | "signature"> {
    const {
        credentials: _credentials,
        token: _token,
        username: _username,
        password: _password,
        signature: _signature,
        ...intent
    } = value;
    return intent;
}

interface MigratedPublishCredentials {
    credentials?: Record<string, unknown>;
    diagnostics: FernConfigMappingDiagnostic[];
}

function migratePublishCredentials(outputMode: unknown, targetIndex: number): MigratedPublishCredentials {
    if (!isRecord(outputMode)) {
        return { diagnostics: [] };
    }
    const output = getPublishCredentialOutput(outputMode);
    if (output == null) {
        return { diagnostics: [] };
    }
    const diagnostics: FernConfigMappingDiagnostic[] = [];
    const credentials = migrateCredentialObject(output.registry, output.value, diagnostics, targetIndex);
    return {
        ...(Object.keys(credentials).length === 0 ? {} : { credentials }),
        diagnostics
    };
}

function getPublishCredentialOutput(
    outputMode: Record<string, unknown>
): { registry: "npm" | "pypi" | "maven" | "crates"; value: Record<string, unknown> } | undefined {
    if (outputMode.type === "publishV2" && isRecord(outputMode.publishV2)) {
        const publish = outputMode.publishV2;
        switch (publish.type) {
            case "npmOverride":
                return isRecord(publish.npmOverride) ? { registry: "npm", value: publish.npmOverride } : undefined;
            case "pypiOverride":
                return isRecord(publish.pypiOverride) ? { registry: "pypi", value: publish.pypiOverride } : undefined;
            case "mavenOverride":
                return isRecord(publish.mavenOverride)
                    ? { registry: "maven", value: publish.mavenOverride }
                    : undefined;
            case "cratesOverride":
                return isRecord(publish.cratesOverride)
                    ? { registry: "crates", value: publish.cratesOverride }
                    : undefined;
        }
    }
    if (outputMode.type === "publish" && isRecord(outputMode.registryOverrides)) {
        if (isRecord(outputMode.registryOverrides.npm)) {
            return { registry: "npm", value: outputMode.registryOverrides.npm };
        }
        if (isRecord(outputMode.registryOverrides.maven)) {
            return { registry: "maven", value: outputMode.registryOverrides.maven };
        }
    }
    return undefined;
}

function migrateCredentialObject(
    registry: "npm" | "pypi" | "maven" | "crates",
    value: Record<string, unknown>,
    diagnostics: FernConfigMappingDiagnostic[],
    targetIndex: number
): Record<string, unknown> {
    if (registry === "npm" || registry === "crates") {
        const token = migrateCredentialValue(registry, "token", value.token, diagnostics, targetIndex);
        return token == null ? {} : { token };
    }
    const username = migrateCredentialValue(registry, "username", value.username, diagnostics, targetIndex);
    const password = migrateCredentialValue(registry, "password", value.password, diagnostics, targetIndex);
    const credentials = {
        ...(username == null ? {} : { username }),
        ...(password == null ? {} : { password })
    };
    if (registry !== "maven" || value.signature == null) {
        return credentials;
    }
    if (!isRecord(value.signature)) {
        diagnostics.push(credentialMigrationDiagnostic(registry, "signature", targetIndex));
        return credentials;
    }
    const signatureValue = value.signature;
    const signatureFields: Array<"keyId" | "password" | "secretKey"> = ["keyId", "password", "secretKey"];
    const signature = Object.fromEntries(
        signatureFields.flatMap((field) => {
            const migrated = exactEnvironmentExpression(signatureValue[field]);
            return migrated == null ? [] : [[field, migrated]];
        })
    );
    if (Object.keys(signature).length !== signatureFields.length) {
        diagnostics.push(credentialMigrationDiagnostic(registry, "signature", targetIndex));
        return credentials;
    }
    return { ...credentials, signature };
}

function migrateCredentialValue(
    registry: string,
    field: string,
    value: unknown,
    diagnostics: FernConfigMappingDiagnostic[],
    targetIndex: number
): string | undefined {
    if (value == null || (typeof value === "string" && value.trim().length === 0)) {
        return undefined;
    }
    const expression = exactEnvironmentExpression(value);
    if (expression != null) {
        return expression;
    }
    diagnostics.push(credentialMigrationDiagnostic(registry, field, targetIndex));
    return undefined;
}

function exactEnvironmentExpression(value: unknown): string | undefined {
    return typeof value === "string" && /^\$\{\w+\}$/.test(value) ? value : undefined;
}

function credentialMigrationDiagnostic(
    registry: string,
    field: string,
    targetIndex: number
): FernConfigMappingDiagnostic {
    return {
        code: "FERN_PUBLISH_CREDENTIAL_REQUIRES_ENVIRONMENT_VARIABLE",
        severity: "warning",
        path: ["targets", targetIndex.toString(), "output", "publish", field],
        reason: `The ${registry} ${field} credential is not an exact environment-variable expression and was omitted to prevent writing a resolved secret.`,
        sdkConfigPath: ["targets", targetIndex.toString(), "output", "publish", field],
        suggestedAction: `Configure targets.${targetIndex}.output.publish.${field} with an environment variable such as \${REGISTRY_CREDENTIAL}.`
    };
}

function isPublishCredentialDiagnostic(diagnostic: FernConfigMappingDiagnostic): boolean {
    const path = diagnostic.path.filter((segment): segment is string => typeof segment === "string");
    return (
        path.includes("output") &&
        path.includes("publish") &&
        path.some((segment) =>
            ["token", "username", "password", "signature", "secretKey", "keyId", "credentials"].includes(segment)
        )
    );
}

export function mapFernDefinitionToSdkConfigApi(
    definition: FernDefinition,
    sourceDerivedApiFields?: SourceDerivedApiFields
): {
    api: SdkConfigV1ApiConfigInput;
    diagnostics: FernConfigMappingDiagnostic[];
} {
    const root = definition.rootApiFile.contents;
    const environments = sourceDerivedApiFields?.environments
        ? []
        : Object.entries(root.environments ?? {})
              .sort(([left], [right]) => left.localeCompare(right))
              .map(([name, environment]) => ({
                  name,
                  urls: mapEnvironmentUrls(environment),
                  ...(typeof environment === "string" || environment.docs == null
                      ? {}
                      : { description: environment.docs })
              }));
    const sourceDerivedHeaderNames = new Set(
        (sourceDerivedApiFields?.headerNames ?? []).map((headerName) => headerName.toLowerCase())
    );
    const headers = Object.entries(root.headers ?? {})
        .filter(([headerName]) => !sourceDerivedHeaderNames.has(headerName.toLowerCase()))
        .map(([headerName, header]) =>
            typeof header === "string"
                ? { name: headerName }
                : {
                      name: header.name ?? headerName,
                      ...(header.env == null ? {} : { environmentVariable: header.env }),
                      ...(header.docs == null ? {} : { description: header.docs })
                  }
        );
    const auth = sourceDerivedApiFields?.auth ? { diagnostics: [] } : mapFernAuth(root);
    const baseUrl = sourceDerivedApiFields?.environments
        ? undefined
        : (root["default-url"] ?? definition.rootApiFile.defaultUrl);
    return {
        api: {
            ...(baseUrl == null ? {} : { baseUrl }),
            ...(sourceDerivedApiFields?.environments || root["default-environment"] == null
                ? {}
                : { defaultEnvironment: root["default-environment"] }),
            ...(environments.length === 0 ? {} : { environments }),
            ...(headers.length === 0 ? {} : { headers }),
            ...(auth.auth == null ? {} : { auth: auth.auth })
        },
        diagnostics: auth.diagnostics
    };
}

type FernApiContents = FernDefinition["rootApiFile"]["contents"];
type SdkConfigAuth = NonNullable<SdkConfigV1ApiConfigInput["auth"]>;
type SdkConfigAuthScheme = SdkConfigAuth["schemes"][number];
type FernAuthReference = string | RawSchemas.AuthSchemeReferenceSchema;
type FernAuthSelection = {
    references: FernAuthReference[];
    endpointSecurity: boolean | undefined;
    requirements: Array<{ schemes: string[] }> | undefined;
};

function mapFernAuth(root: FernApiContents): {
    auth?: SdkConfigAuth;
    diagnostics: FernConfigMappingDiagnostic[];
} {
    const declarations = root["auth-schemes"] ?? {};
    const selection: FernAuthSelection | undefined =
        root.auth == null
            ? Object.keys(declarations).length === 0
                ? undefined
                : {
                      references: Object.keys(declarations),
                      endpointSecurity: true,
                      requirements: undefined
                  }
            : visitRawApiAuth<FernAuthSelection>(root.auth, {
                  single: (reference) => ({
                      references: [reference],
                      endpointSecurity: undefined,
                      requirements: [{ schemes: [authReferenceId(reference)] }]
                  }),
                  any: ({ any }) => ({
                      references: any,
                      endpointSecurity: undefined,
                      requirements: any.map((reference) => ({ schemes: [authReferenceId(reference)] }))
                  }),
                  endpointSecurity: () => ({
                      references: Object.keys(declarations),
                      endpointSecurity: true,
                      requirements: undefined
                  })
              });
    if (selection == null) {
        return { diagnostics: [] };
    }

    const schemes = selection.references.map((reference) => ({
        id: authReferenceId(reference),
        scheme: mapFernAuthScheme(reference, declarations)
    }));
    const unsupportedSchemeIds = [...new Set(schemes.filter(({ scheme }) => scheme == null).map(({ id }) => id))];
    const mappedSchemes = schemes.flatMap(({ scheme }) => (scheme == null ? [] : [scheme]));
    if (unsupportedSchemeIds.length > 0 || mappedSchemes.length === 0) {
        return {
            diagnostics: [unsupportedAuthDiagnostic(unsupportedSchemeIds)]
        };
    }

    // SDK Config declares each scheme once by id while requirements retain Fern's auth selection.
    // When an id is repeated, the last reference supplies its optional reference-level docs.
    const uniqueSchemes = [...new Map(mappedSchemes.map((scheme) => [scheme.id, scheme])).values()];
    return {
        auth: {
            schemes: uniqueSchemes,
            ...(selection.requirements == null ? {} : { requirements: selection.requirements }),
            ...(selection.endpointSecurity == null ? {} : { endpointSecurity: selection.endpointSecurity })
        },
        diagnostics: []
    };
}

function mapFernAuthScheme(
    reference: FernAuthReference,
    declarations: NonNullable<FernApiContents["auth-schemes"]>
): SdkConfigAuthScheme | undefined {
    const id = authReferenceId(reference);
    const referenceDocs = typeof reference === "string" ? undefined : reference.docs;
    if (id === "bearer" && declarations[id] == null) {
        return { id, type: "bearer", ...(referenceDocs == null ? {} : { description: referenceDocs }) };
    }
    if (id === "basic" && declarations[id] == null) {
        return { id, type: "basic", ...(referenceDocs == null ? {} : { description: referenceDocs }) };
    }

    const declaration = declarations[id];
    if (declaration == null) {
        return undefined;
    }
    const description = referenceDocs ?? declaration.docs;
    return visitRawAuthSchemeDeclaration<SdkConfigAuthScheme | undefined>(declaration, {
        header: (header) => ({
            id,
            type: "api-key",
            location: "header",
            name: header.header,
            ...(header.prefix == null ? {} : { prefix: header.prefix }),
            ...(header.env == null ? {} : { environmentVariable: header.env }),
            ...(description == null ? {} : { description })
        }),
        basic: (basic) => ({
            id,
            type: "basic",
            ...(basic.username == null ? {} : { username: mapFernAuthVariable(basic.username) }),
            ...(basic.password == null ? {} : { password: mapFernAuthVariable(basic.password) }),
            ...(description == null ? {} : { description })
        }),
        tokenBearer: (bearer) => ({
            id,
            type: "bearer",
            ...(bearer.token?.env == null ? {} : { environmentVariable: bearer.token.env }),
            ...(description == null ? {} : { description })
        }),
        oauth: () => undefined,
        inferredBearer: () => undefined
    });
}

function mapFernAuthVariable(variable: { name?: string; env?: string; omit?: boolean }): {
    name?: string;
    environmentVariable?: string;
    omit?: boolean;
} {
    return {
        ...(variable.name == null ? {} : { name: variable.name }),
        ...(variable.env == null ? {} : { environmentVariable: variable.env }),
        ...(variable.omit == null ? {} : { omit: variable.omit })
    };
}

function authReferenceId(reference: FernAuthReference): string {
    return typeof reference === "string" ? reference : reference.scheme;
}

function unsupportedAuthDiagnostic(schemeIds: readonly string[]): FernConfigMappingDiagnostic {
    const schemeDetail =
        schemeIds.length === 0 ? "" : ` Unsupported or unresolved scheme ids: ${schemeIds.join(", ")}.`;
    return {
        code: "FERN_API_AUTH_REQUIRES_REVIEW",
        severity: "warning",
        path: ["api", "auth"],
        reason: `Fern API authentication includes a scheme that cannot be represented safely by this migration command.${schemeDetail}`,
        sdkConfigPath: ["api", "auth"],
        suggestedAction: "Review the Fern auth schemes and configure api.auth manually in SDK Config v1."
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
    return Object.entries(environment.urls)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([name, url]) => ({ name, url }));
}

function normalizeGeneratorForMapping(generator: generatorsYml.GeneratorInvocation): FernResolvedGeneratorInput {
    return {
        ...generator,
        // Migrated SDK Config targets intentionally float to the latest supported generator.
        // Customers can add generatorVersion later when they want to pin an exact version.
        version: undefined,
        outputMode: normalizeResolvedOutput(generator.outputMode)
    };
}

function normalizeResolvedOutput(value: unknown, fieldName?: string): unknown {
    // Coordinates are normalized before the SDK Config mapper validates their segments.
    if (fieldName === "coordinate" && typeof value === "string") {
        return value
            .split(":")
            .map((part) => part.trim())
            .join(":");
    }
    if (Array.isArray(value)) {
        return value.map((item) => normalizeResolvedOutput(item, fieldName));
    }
    if (!isRecord(value)) {
        return value;
    }
    return Object.fromEntries(
        Object.entries(value).flatMap(([key, child]) => {
            // `_visit` is a generated Fern union helper. Empty credential placeholders are removed
            // to avoid false diagnostics; configured credentials remain so the mapper can warn.
            // False `downloadSnippets` is the default rather than explicit migration intent.
            if (key === "_visit" || isEmptyCredential(key, child) || (key === "downloadSnippets" && child === false)) {
                return [];
            }
            return [[key, normalizeResolvedOutput(child, key)]];
        })
    );
}

function isEmptyCredential(fieldName: string, value: unknown): boolean {
    return (
        ["apiKey", "password", "token", "username"].includes(fieldName) &&
        typeof value === "string" &&
        value.trim() === ""
    );
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}
