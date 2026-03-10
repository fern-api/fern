import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { RawSchemas, visitRawApiAuth } from "@fern-api/fern-definition-schema";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { convert, getConvertOptions } from "@fern-api/openapi-ir-to-fern";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { mapValues } from "lodash-es";

import { FernDefinition } from "../index.js";
import { BaseOpenAPIWorkspace } from "./BaseOpenAPIWorkspace.js";

/**
 * Extracts the auth scheme names referenced by an auth configuration.
 */
function getReferencedAuthSchemeNames(
    auth: RawSchemas.ApiAuthSchema,
    authSchemes: Record<string, RawSchemas.AuthSchemeDeclarationSchema> | undefined
): string[] {
    return visitRawApiAuth(auth, {
        single: (scheme) => {
            const schemeName = typeof scheme === "string" ? scheme : scheme.scheme;
            return [schemeName];
        },
        any: (anySchemes) => {
            return anySchemes.any.map((scheme) => (typeof scheme === "string" ? scheme : scheme.scheme));
        },
        endpointSecurity: () => {
            // For endpoint-security auth, all auth schemes are available for use at the endpoint level
            return authSchemes != null ? Object.keys(authSchemes) : [];
        }
    });
}

/**
 * Filters auth-schemes to only include those referenced by the given auth configuration.
 * Built-in schemes (bearer, basic, oauth) don't need to be in auth-schemes.
 */
function filterAuthSchemes(
    authSchemes: Record<string, RawSchemas.AuthSchemeDeclarationSchema> | undefined,
    auth: RawSchemas.ApiAuthSchema
): Record<string, RawSchemas.AuthSchemeDeclarationSchema> | undefined {
    if (authSchemes == null) {
        return undefined;
    }
    const referencedNames = getReferencedAuthSchemeNames(auth, authSchemes);
    const filtered: Record<string, RawSchemas.AuthSchemeDeclarationSchema> = {};
    for (const name of referencedNames) {
        if (authSchemes[name] != null) {
            filtered[name] = authSchemes[name];
        }
    }
    return Object.keys(filtered).length > 0 ? filtered : undefined;
}

export class FernDefinitionConverter {
    constructor(private readonly args: BaseOpenAPIWorkspace.Args) {}

    /**
     * Builds the header overrides for a generator, merging top-level headers with
     * per-generator headers (per-generator takes precedence for same-key headers).
     */
    private buildHeaderOverrides(
        perGeneratorHeaders: Record<string, RawSchemas.HttpHeaderSchema> | undefined
    ): RawSchemas.WithHeadersSchema | undefined {
        const topLevelHeaders = this.args.generatorsConfiguration?.api?.headers;

        const effectiveHeaders =
            perGeneratorHeaders != null || topLevelHeaders != null
                ? { ...topLevelHeaders, ...perGeneratorHeaders }
                : undefined;

        if (effectiveHeaders == null) {
            return undefined;
        }

        return { headers: effectiveHeaders };
    }

    /**
     * Builds the auth overrides for a generator, filtering auth-schemes to only include
     * those referenced by the effective auth (per-generator override or top-level).
     */
    private buildAuthOverrides(
        perGeneratorAuth: RawSchemas.ApiAuthSchema | undefined,
        perGeneratorAuthSchemes: Record<string, RawSchemas.AuthSchemeDeclarationSchema> | undefined
    ): RawSchemas.WithAuthSchema | undefined {
        const topLevelAuthSchemes = this.args.generatorsConfiguration?.api?.["auth-schemes"];
        const topLevelAuth = this.args.generatorsConfiguration?.api?.auth;

        // Determine the effective auth (per-generator override takes precedence)
        const effectiveAuth = perGeneratorAuth ?? topLevelAuth;

        if (effectiveAuth == null) {
            return undefined;
        }

        // Merge auth-schemes: per-generator overrides take precedence over top-level
        const allAuthSchemes =
            perGeneratorAuthSchemes != null || topLevelAuthSchemes != null
                ? { ...topLevelAuthSchemes, ...perGeneratorAuthSchemes }
                : undefined;

        // Filter auth-schemes to only include those referenced by the effective auth
        const filteredAuthSchemes = filterAuthSchemes(allAuthSchemes, effectiveAuth);

        return {
            auth: effectiveAuth,
            "auth-schemes": filteredAuthSchemes
        };
    }

    public convert({
        context,
        ir,
        settings,
        absoluteFilePath
    }: {
        context: TaskContext;
        ir: OpenApiIntermediateRepresentation;
        settings?: BaseOpenAPIWorkspace.Settings;
        absoluteFilePath?: AbsoluteFilePath;
    }): FernDefinition {
        const definition = convert({
            taskContext: context,
            ir,
            options: getConvertOptions({
                options: settings,
                overrides: this.args
            }),
            authOverrides: this.buildAuthOverrides(settings?.auth, settings?.authSchemes),
            environmentOverrides:
                this.args.generatorsConfiguration?.api?.environments != null
                    ? { ...this.args.generatorsConfiguration?.api }
                    : undefined,
            globalHeaderOverrides: this.buildHeaderOverrides(settings?.headers)
        });

        return {
            absoluteFilePath: absoluteFilePath ?? this.args.absoluteFilePath,
            rootApiFile: {
                defaultUrl: definition.rootApiFile["default-url"],
                contents: definition.rootApiFile,
                rawContents: yaml.dump(definition.rootApiFile)
            },
            namedDefinitionFiles: {
                ...mapValues(definition.definitionFiles, (definitionFile) => ({
                    absoluteFilepath: absoluteFilePath ?? this.args.absoluteFilePath,
                    rawContents: yaml.dump(definitionFile),
                    contents: definitionFile
                })),
                [RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)]: {
                    absoluteFilepath: absoluteFilePath ?? this.args.absoluteFilePath,
                    rawContents: yaml.dump(definition.packageMarkerFile),
                    contents: definition.packageMarkerFile
                }
            },
            packageMarkers: {},
            importedDefinitions: {}
        };
    }
}
