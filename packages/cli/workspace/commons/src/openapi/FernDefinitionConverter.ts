import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { RawSchemas, visitRawApiAuth } from "@fern-api/fern-definition-schema";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { convert, getConvertOptions } from "@fern-api/openapi-ir-to-fern";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { mapValues } from "lodash-es";

import { FernDefinition } from "..";
import { BaseOpenAPIWorkspace } from "./BaseOpenAPIWorkspace";

/**
 * Extracts the auth scheme names referenced by an auth configuration.
 */
function getReferencedAuthSchemeNames(auth: RawSchemas.ApiAuthSchema): string[] {
    return visitRawApiAuth(auth, {
        single: (scheme) => {
            const schemeName = typeof scheme === "string" ? scheme : scheme.scheme;
            return [schemeName];
        },
        any: (anySchemes) => {
            return anySchemes.any.map((scheme) => (typeof scheme === "string" ? scheme : scheme.scheme));
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
    const referencedNames = getReferencedAuthSchemeNames(auth);
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
     * Builds the auth overrides for a generator, filtering auth-schemes to only include
     * those referenced by the effective auth (per-generator override or top-level).
     */
    private buildAuthOverrides(
        perGeneratorAuth: RawSchemas.ApiAuthSchema | undefined
    ): RawSchemas.WithAuthSchema | undefined {
        const allAuthSchemes = this.args.generatorsConfiguration?.api?.["auth-schemes"];
        const topLevelAuth = this.args.generatorsConfiguration?.api?.auth;

        // Determine the effective auth (per-generator override takes precedence)
        const effectiveAuth = perGeneratorAuth ?? topLevelAuth;

        if (effectiveAuth == null) {
            return undefined;
        }

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
            authOverrides: this.buildAuthOverrides(settings?.auth),
            environmentOverrides:
                this.args.generatorsConfiguration?.api?.environments != null
                    ? { ...this.args.generatorsConfiguration?.api }
                    : undefined,
            globalHeaderOverrides:
                this.args.generatorsConfiguration?.api?.headers != null
                    ? { ...this.args.generatorsConfiguration?.api }
                    : undefined
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
