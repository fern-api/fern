import yaml from "js-yaml";
import { camelCase } from "lodash-es";
import { OpenAPIV3_1 } from "openapi-types";

import { OpenAPISettings } from "@fern-api/api-workspace-commons";
import { CasingsGenerator, constructCasingsGenerator } from "@fern-api/casings-generator";
import { generatorsYml } from "@fern-api/configuration";
import {
    Availability,
    AvailabilityStatus,
    ContainerType,
    DeclaredTypeName,
    FernFilepath,
    ObjectPropertyAccess,
    Package,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-api/ir-sdk";
import { ExampleGenerationArgs } from "@fern-api/ir-utils";
import { Logger } from "@fern-api/logger";

import { Extensions } from ".";
import { ErrorCollector } from "./ErrorCollector";

export declare namespace Spec {
    export interface Args<T> {
        spec: T;
        settings?: OpenAPISettings;
        logger: Logger;
        generationLanguage: generatorsYml.GenerationLanguage | undefined;
        smartCasing: boolean;
        namespace?: string;
        exampleGenerationArgs: ExampleGenerationArgs;
    }
}

/**
 * Abstract context class for OpenAPI spec conversion
 * @template Spec The OpenAPI specification type
 */
export abstract class AbstractConverterContext<Spec extends object> {
    public spec: Spec;
    public readonly settings?: OpenAPISettings;
    public readonly logger: Logger;
    public readonly generationLanguage: generatorsYml.GenerationLanguage | undefined;
    public readonly smartCasing: boolean;
    public readonly casingsGenerator: CasingsGenerator;
    public readonly namespace?: string;
    public readonly exampleGenerationArgs: ExampleGenerationArgs;

    constructor(protected readonly args: Spec.Args<Spec>) {
        this.spec = args.spec;
        this.settings = args.settings;
        this.logger = args.logger;
        this.generationLanguage = args.generationLanguage;
        this.smartCasing = args.smartCasing;
        this.namespace = args.namespace;
        this.casingsGenerator = constructCasingsGenerator({
            generationLanguage: args.generationLanguage,
            keywords: undefined,
            smartCasing: args.smartCasing
        });
        this.exampleGenerationArgs = args.exampleGenerationArgs;
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
            fernFilepath: this.createFernFilepath(args),
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
     * Creates a FernFilepath object with optional name
     * @param args Optional object containing name
     * @returns FernFilepath object
     */
    public createFernFilepath(args: { name?: string } = {}): FernFilepath {
        const packagePath = this.namespace != null ? [this.casingsGenerator.generateName(this.namespace)] : [];
        const file = args.name != null ? this.casingsGenerator.generateName(args.name) : undefined;
        return {
            allParts: file ? [...packagePath, file] : packagePath,
            packagePath,
            file
        };
    }

    /**
     * Resolves a reference object to its actual schema
     * @param reference The reference object to resolve
     * @returns Object containing ok status and resolved reference if successful
     */
    public async resolveReference<T>(reference: {
        $ref: string;
    }): Promise<{ resolved: true; value: T } | { resolved: false }> {
        let resolvedReference: unknown = this.spec;
        let fragment: string | undefined;

        if (reference.$ref.startsWith("http://") || reference.$ref.startsWith("https://")) {
            const splitReference = reference.$ref.split("#");
            const url = splitReference[0];
            fragment = splitReference[1];

            if (!url) {
                return { resolved: false };
            }

            const response = await fetch(url);

            if (!response.ok) {
                return { resolved: false };
            }
            try {
                const responseText = await response.text();
                try {
                    resolvedReference = JSON.parse(responseText);
                } catch {
                    resolvedReference = yaml.load(responseText);
                }
                if (resolvedReference == null) {
                    return { resolved: false };
                }
            } catch (error) {
                return { resolved: false };
            }

            if (!fragment) {
                return { resolved: true, value: resolvedReference as T };
            }
        }

        const keys = (fragment ?? reference.$ref)
            .replace(/^(?:(?:https?:\/\/)?|#?\/?)?/, "")
            .split("/")
            .map((key) => key.replace(/~1/g, "/"));

        for (const key of keys) {
            if (typeof resolvedReference !== "object" || resolvedReference == null) {
                return { resolved: false };
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            resolvedReference = (resolvedReference as any)[key];
        }

        if (resolvedReference == null) {
            return { resolved: false };
        }

        return { resolved: true, value: resolvedReference as unknown as T };
    }

    public async getPropertyAccess(
        schemaOrReference: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject
    ): Promise<ObjectPropertyAccess | undefined> {
        let schema = schemaOrReference;

        while (this.isReferenceObject(schema)) {
            const resolved = await this.resolveReference<OpenAPIV3_1.SchemaObject>(schema);
            if (!resolved.resolved) {
                return undefined;
            }
            schema = resolved.value;
        }

        if (schema.readOnly && schema.writeOnly) {
            return undefined;
        }

        if (schema.readOnly) {
            return ObjectPropertyAccess.ReadOnly;
        }

        if (schema.writeOnly) {
            return ObjectPropertyAccess.WriteOnly;
        }

        return undefined;
    }

    public async getAvailability({
        node,
        breadcrumbs,
        errorCollector
    }: {
        node:
            | OpenAPIV3_1.ReferenceObject
            | OpenAPIV3_1.SchemaObject
            | OpenAPIV3_1.OperationObject
            | OpenAPIV3_1.ParameterObject;
        breadcrumbs: string[];
        errorCollector: ErrorCollector;
    }): Promise<Availability | undefined> {
        while (this.isReferenceObject(node)) {
            const resolved = await this.resolveReference<OpenAPIV3_1.SchemaObject>(node);
            if (!resolved.resolved) {
                return undefined;
            }
            node = resolved.value;
        }

        const availabilityExtension = new Extensions.FernAvailabilityExtension({
            node,
            breadcrumbs
        });
        const availability = await availabilityExtension.convert({
            context: this,
            errorCollector
        });
        if (availability != null) {
            return {
                status: availability,
                message: undefined
            };
        }

        if (node.deprecated === true) {
            return {
                status: AvailabilityStatus.Deprecated,
                message: undefined
            };
        }

        return undefined;
    }

    public getTypeIdFromSchemaReference(reference: OpenAPIV3_1.ReferenceObject): string | undefined {
        const schemaMatch = reference.$ref.match(/\/schemas\/(.+)$/);
        if (!schemaMatch || !schemaMatch[1]) {
            return undefined;
        }
        return schemaMatch[1];
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

    public removeSchemaFromInlinedTypes({
        id,
        inlinedTypes
    }: {
        id: string;
        inlinedTypes: Record<TypeId, TypeDeclaration>;
    }): Record<TypeId, TypeDeclaration> {
        return Object.fromEntries(Object.entries(inlinedTypes).filter(([key]) => key !== id));
    }

    public maybeTrimPrefix(value: string, prefix: string): string {
        if (value.startsWith(prefix)) {
            return value.slice(prefix.length);
        }
        return value;
    }

    public isReferenceObject(value: unknown): value is OpenAPIV3_1.ReferenceObject {
        return typeof value === "object" && value !== null && "$ref" in value;
    }

    public abstract convertReferenceToTypeReference(
        reference: OpenAPIV3_1.ReferenceObject
    ): Promise<{ ok: true; reference: TypeReference } | { ok: false }>;

    /**
     * TypeReference helper methods to check various properties
     */
    public isOptional(
        valueType: TypeReference
    ): valueType is TypeReference.Container & { container: ContainerType.Optional } {
        return valueType.type === "container" && valueType.container.type === "optional";
    }

    public isList(valueType: TypeReference): valueType is TypeReference.Container & { container: ContainerType.List } {
        return valueType.type === "container" && valueType.container.type === "list";
    }

    public isFile(valueType: TypeReference): boolean {
        return (
            valueType.type === "primitive" &&
            valueType.primitive.v2?.type === "string" &&
            valueType.primitive.v2.validation?.format === "binary"
        );
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
