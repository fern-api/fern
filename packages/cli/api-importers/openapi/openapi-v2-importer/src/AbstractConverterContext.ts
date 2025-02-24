import { camelCase } from "lodash-es";

import { OpenAPISettings } from "@fern-api/api-workspace-commons";
import { CasingsGenerator, constructCasingsGenerator } from "@fern-api/casings-generator";
import { generatorsYml } from "@fern-api/configuration";
import { DeclaredTypeName, Package, TypeReference } from "@fern-api/ir-sdk";
import { Logger } from "@fern-api/logger";

export declare namespace Spec {
    export interface Args<T> {
        spec: T;
        settings?: OpenAPISettings;
        logger: Logger;
        generationLanguage: generatorsYml.GenerationLanguage | undefined;
        smartCasing: boolean;
    }
}

/**
 * Abstract context class for OpenAPI spec conversion
 * @template Spec The OpenAPI specification type
 */
export abstract class AbstractConverterContext<Spec extends object> {
    public readonly spec: Spec;
    public readonly settings?: OpenAPISettings;
    public readonly logger: Logger;
    public readonly generationLanguage: generatorsYml.GenerationLanguage | undefined;
    public readonly smartCasing: boolean;
    public readonly casingsGenerator: CasingsGenerator;

    constructor(protected readonly args: Spec.Args<Spec>) {
        this.spec = args.spec;
        this.settings = args.settings;
        this.logger = args.logger;
        this.generationLanguage = args.generationLanguage;
        this.smartCasing = args.smartCasing;
        this.casingsGenerator = constructCasingsGenerator({
            generationLanguage: args.generationLanguage,
            keywords: undefined,
            smartCasing: args.smartCasing
        });
    }

    private static BREADCRUMBS_TO_IGNORE = ["properties", "allOf", "anyOf"];
    /**
     * Converts breadcrumbs into a schema name or type id
     * @param breadcrumbs Array of path segments leading to the schema
     * @returns A string suitable for use as a schema name or type id
     */
    public convertBreadcrumbsToName(breadcrumbs: string[]): string {
        const filteredBreadcrumbs = breadcrumbs.filter((crumb, index) => {
            // Ignore numeric indices
            if (/^\d+$/.test(crumb)) {
                return false;
            }

            // Ignore 'properties' and 'allOf' anywhere
            if (AbstractConverterContext.BREADCRUMBS_TO_IGNORE.includes(crumb)) {
                return false;
            }

            // Ignore 'components' if first crumb
            if (index === 0 && crumb === "components") {
                return false;
            }

            // Ignore 'schemas' if second crumb
            if (index === 1 && crumb === "schemas") {
                return false;
            }

            // Ignore path-related crumbs
            if (breadcrumbs[0] === "paths") {
                // Ignore 'paths' if first crumb
                if (index === 0) {
                    return false;
                }
                // Ignore HTTP methods if second crumb
                if (index === 1 && ["get", "post", "put", "delete", "patch"].includes(crumb)) {
                    return false;
                }
                // Ignore 'parameters' if third crumb after HTTP method
                if (
                    index === 2 &&
                    breadcrumbs[1] != null &&
                    ["get", "post", "put", "delete", "patch"].includes(breadcrumbs[1]) &&
                    crumb === "parameters"
                ) {
                    return false;
                }
            }

            return true;
        });

        const camelCased = camelCase(filteredBreadcrumbs.join("_"));
        return camelCased.charAt(0).toUpperCase() + camelCased.slice(1);
    }

    /**
     * Creates a Package object with default values
     * @param args Optional object containing package name
     * @returns Package object with default values
     */
    public createPackage(args: { name?: string } = {}): Package {
        return {
            fernFilepath: {
                allParts: [],
                packagePath: [],
                file: args.name != null ? this.casingsGenerator.generateName(args.name) : undefined
            },
            service: undefined,
            types: [],
            errors: [],
            subpackages: [],
            docs: undefined,
            webhooks: undefined,
            websocket: undefined,
            hasEndpointsInTree: false,
            navigationConfig: undefined
        };
    }

    /**
     * Resolves a reference object to its actual schema
     * @param reference The reference object to resolve
     * @returns Object containing ok status and resolved reference if successful
     */
    public resolveReference<T>(reference: { $ref: string }): { resolved: true; value: T } | { resolved: false } {
        // Step 1: Get keys
        const keys = reference.$ref
            .substring(2)
            .split("/")
            .map((key) => key.replace(/~1/g, "/"));

        // Step 2: Index recursively into the document with all the keys
        let resolvedReference: any = this.spec;
        for (const key of keys) {
            if (typeof resolvedReference !== "object" || resolvedReference == null) {
                return { resolved: false };
            }
            resolvedReference = resolvedReference[key];
        }

        if (resolvedReference == null) {
            return { resolved: false };
        }

        return { resolved: true, value: resolvedReference as T };
    }

    public createNamedTypeReference(id: string): TypeReference {
        return TypeReference.named({
            fernFilepath: {
                allParts: [],
                packagePath: [],
                file: undefined
            },
            name: this.casingsGenerator.generateName(id ?? "defaultName"),
            typeId: id,
            default: undefined,
            inline: false
        });
    }

    public typeReferenceToDeclaredTypeName(typeReference: TypeReference): DeclaredTypeName | undefined {
        if (typeReference.type !== "named") {
            return undefined;
        }
        const typeId = typeReference.typeId;
        return {
            typeId,
            fernFilepath: {
                allParts: [],
                packagePath: [],
                file: undefined
            },
            name: this.casingsGenerator.generateName(typeId)
        };
    }

    /**
     * Schema reader methods to safely get typed values
     */

    public getAsString(value: unknown): string | undefined {
        if (typeof value === "string") {
            return value;
        }
        return undefined;
    }

    public getAsInteger(value: unknown): number | undefined {
        if (typeof value === "number" && Number.isInteger(value)) {
            return value;
        }
        return undefined;
    }

    public getAsNumber(value: unknown): number | undefined {
        if (typeof value === "number") {
            return value;
        }
        return undefined;
    }

    public getAsBoolean(value: unknown): boolean | undefined {
        if (typeof value === "boolean") {
            return value;
        }
        return undefined;
    }

    public getAsArray(value: unknown): unknown[] | undefined {
        if (Array.isArray(value)) {
            return value;
        }
        return undefined;
    }

    public getAsObject(value: unknown): Record<string, unknown> | undefined {
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            return value as Record<string, unknown>;
        }
        return undefined;
    }
}
