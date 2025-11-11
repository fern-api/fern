import { OpenAPISettings } from "@fern-api/api-workspace-commons";
import { CasingsGenerator, constructCasingsGenerator } from "@fern-api/casings-generator";
import { generatorsYml } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import {
    Availability,
    AvailabilityStatus,
    ContainerType,
    DeclaredTypeName,
    FernFilepath,
    ObjectPropertyAccess,
    TypeId,
    TypeReference
} from "@fern-api/ir-sdk";
import { ExampleGenerationArgs } from "@fern-api/ir-utils";
import { Logger } from "@fern-api/logger";
import yaml from "js-yaml";
import { camelCase } from "lodash-es";
import { OpenAPIV3_1 } from "openapi-types";

import { Extensions } from ".";
import { SchemaConverter } from "./converters/schema/SchemaConverter";
import { APIErrorLevel, ErrorCollector } from "./ErrorCollector";

export type DisplayNameOverrideSource = "schema_identifier" | "discriminator_key" | "reference_identifier";

export declare namespace Spec {
    export interface Args<T> {
        spec: T;
        settings: OpenAPISettings;
        errorCollector: ErrorCollector;
        logger: Logger;
        generationLanguage: generatorsYml.GenerationLanguage | undefined;
        smartCasing: boolean;
        namespace?: string;
        exampleGenerationArgs: ExampleGenerationArgs;
        authOverrides?: RawSchemas.WithAuthSchema;
        environmentOverrides?: RawSchemas.WithEnvironmentsSchema;
        globalHeaderOverrides?: RawSchemas.WithHeadersSchema;
        enableUniqueErrorsPerEndpoint: boolean;
        generateV1Examples: boolean;
        documentBaseDir?: string;
    }
}

/**
 * Abstract context class for OpenAPI spec conversion
 * @template Spec The OpenAPI specification type
 */
export abstract class AbstractConverterContext<Spec extends object> {
    public spec: Spec;
    public readonly settings: OpenAPISettings;
    public readonly errorCollector: ErrorCollector;
    public readonly logger: Logger;
    public readonly generationLanguage: generatorsYml.GenerationLanguage | undefined;
    public readonly smartCasing: boolean;
    public readonly casingsGenerator: CasingsGenerator;
    public readonly namespace?: string;
    public readonly exampleGenerationArgs: ExampleGenerationArgs;
    public readonly authOverrides?: RawSchemas.WithAuthSchema;
    public readonly environmentOverrides?: RawSchemas.WithEnvironmentsSchema;
    public readonly globalHeaderOverrides?: RawSchemas.WithHeadersSchema;
    public readonly enableUniqueErrorsPerEndpoint: boolean;
    public readonly generateV1Examples: boolean;
    public readonly documentBaseDir?: string;

    constructor(protected readonly args: Spec.Args<Spec>) {
        this.spec = args.spec;
        this.settings = args.settings;
        this.errorCollector = args.errorCollector;
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
        this.authOverrides = args.authOverrides;
        this.environmentOverrides = args.environmentOverrides;
        this.globalHeaderOverrides = args.globalHeaderOverrides;
        this.enableUniqueErrorsPerEndpoint = args.enableUniqueErrorsPerEndpoint;
        this.generateV1Examples = args.generateV1Examples;
        this.documentBaseDir = args.documentBaseDir;
    }

    private static BREADCRUMBS_TO_IGNORE = ["properties", "allOf", "anyOf"];

    public abstract convertReferenceToTypeReference({
        reference,
        breadcrumbs,
        displayNameOverride,
        displayNameOverrideSource
    }: {
        reference: OpenAPIV3_1.ReferenceObject;
        breadcrumbs?: string[];
        displayNameOverride?: string | undefined;
        displayNameOverrideSource?: DisplayNameOverrideSource;
    }):
        | { ok: true; reference: TypeReference; inlinedTypes?: Record<string, SchemaConverter.ConvertedSchema> }
        | { ok: false };

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
    public resolveReference<T>({
        reference,
        breadcrumbs,
        skipErrorCollector
    }: {
        reference: OpenAPIV3_1.ReferenceObject;
        breadcrumbs?: string[];
        skipErrorCollector?: boolean;
    }): { resolved: true; value: T } | { resolved: false } {
        let resolvedReference: unknown = this.spec;

        const keys = reference.$ref
            .replace(/^(?:(?:https?:\/\/)?|#?\/?)?/, "")
            .split("/")
            .map((key) => key.replace(/~1/g, "/"));

        for (const key of keys) {
            if (typeof resolvedReference !== "object" || resolvedReference == null) {
                if (!skipErrorCollector) {
                    this.errorCollector.collect({
                        level: APIErrorLevel.ERROR,
                        message: this.getErrorMessageForMissingRef({ reference }),
                        path: breadcrumbs
                    });
                }
                return { resolved: false };
            }
            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            resolvedReference = (resolvedReference as any)[key];
        }

        if (resolvedReference == null) {
            if (!skipErrorCollector) {
                this.errorCollector.collect({
                    level: APIErrorLevel.ERROR,
                    message: this.getErrorMessageForMissingRef({ reference }),
                    path: breadcrumbs
                });
            }
            return { resolved: false };
        }

        return { resolved: true, value: resolvedReference as unknown as T };
    }

    private getErrorMessageForMissingRef({ reference }: { reference: OpenAPIV3_1.ReferenceObject }): string {
        // Check if the reference is to a schema in components/schemas
        const refPath = reference.$ref.replace(/^(?:(?:https?:\/\/)?|#?\/?)?/, "").split("/");

        // Check if the reference follows the pattern components/schemas/<schema>
        if (refPath.length >= 3 && refPath[0] === "components" && refPath[1] === "schemas") {
            const schemaName = refPath[2];
            return `Schema ${schemaName} does not exist`;
        }

        // Default error message
        return `${reference.$ref} does not exist`;
    }

    /**
     * Resolves a reference object to its actual schema
     * @param reference The reference object to resolve
     * @returns Object containing ok status and resolved reference if successful
     */
    public async resolveMaybeExternalReference<T>(reference: {
        $ref: string;
    }): Promise<{ resolved: true; value: T } | { resolved: false }> {
        let resolvedReference: unknown = this.spec;
        let referencePath: string | undefined;
        let isExternalRef: boolean = false;
        let externalDoc: unknown | null = null;
        let baseUrl: string | undefined;

        if (this.isExternalReference(reference.$ref)) {
            isExternalRef = true;
            const splitReference = reference.$ref.split("#");
            const url = splitReference[0];
            referencePath = splitReference[1];

            if (!url) {
                return { resolved: false };
            }
            baseUrl = url;

            const response = await fetch(url);

            if (!response.ok) {
                return { resolved: false };
            }
            try {
                const responseText = await response.text();
                try {
                    externalDoc = JSON.parse(responseText);
                    resolvedReference = externalDoc;
                } catch {
                    externalDoc = yaml.load(responseText);
                    resolvedReference = externalDoc;
                }
                if (resolvedReference == null) {
                    return { resolved: false };
                }
            } catch (error) {
                return { resolved: false };
            }

            if (!referencePath) {
                return { resolved: true, value: resolvedReference as T };
            }
        }

        const maybeReferenceString = referencePath ?? reference.$ref;
        if (maybeReferenceString == null || typeof maybeReferenceString !== "string") {
            return { resolved: false };
        }

        const keys = maybeReferenceString
            .replace(/^(?:(?:https?:\/\/)?|#?\/?)?/, "")
            .split("/")
            .map((key) => key.replace(/~1/g, "/"));

        for (const key of keys) {
            if (typeof resolvedReference !== "object" || resolvedReference == null) {
                return { resolved: false };
            }
            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            resolvedReference = (resolvedReference as any)[key];
        }

        if (resolvedReference == null) {
            return { resolved: false };
        }

        if (isExternalRef && typeof resolvedReference === "object" && resolvedReference !== null) {
            const visitedRefs = new Set<string>();
            visitedRefs.add(reference.$ref);

            resolvedReference = await this.resolveNestedExternalReferences(
                resolvedReference,
                externalDoc,
                visitedRefs,
                baseUrl
            );
        }

        return { resolved: true, value: resolvedReference as unknown as T };
    }

    /**
     * Helper function to resolve nested external references
     * @param obj The object to resolve
     * @param rootDoc The root document to resolve against
     * @returns The resolved object
     */
    private async resolveNestedExternalReferences(
        obj: unknown,
        rootDoc: unknown,
        visitedRefs: Set<string>,
        baseUrl: string | undefined
    ): Promise<unknown> {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }

        if (Array.isArray(obj)) {
            const result = [];
            for (const item of obj) {
                result.push(await this.resolveNestedExternalReferences(item, rootDoc, visitedRefs, baseUrl));
            }
            return result;
        }

        if (this.isReferenceObject(obj)) {
            const refValue = obj.$ref;
            if (this.isExternalReference(refValue)) {
                if (visitedRefs.has(refValue)) {
                    return obj;
                }
                visitedRefs.add(refValue);
                const refResult = await this.resolveMaybeExternalReference({ $ref: refValue });
                visitedRefs.delete(refValue);
                if (refResult.resolved) {
                    return refResult.value;
                }
            } else {
                const fullRef = `${baseUrl}${refValue}`;
                if (visitedRefs.has(fullRef)) {
                    return obj;
                }
                visitedRefs.add(fullRef);

                let tempRef = rootDoc;
                const refPath = refValue
                    .substring(2) // Remove leading "#/"
                    .split("/")
                    .map((seg) => seg.replace(/~1/g, "/").replace(/~0/g, "~"));

                for (const segment of refPath) {
                    if (typeof tempRef !== "object" || tempRef === null) {
                        // Cannot resolve fully — keep the original ref
                        return obj;
                    }
                    tempRef = (tempRef as Record<string, unknown>)[segment];
                }

                if (tempRef !== undefined && tempRef !== null) {
                    const resolvedNested = await this.resolveNestedExternalReferences(
                        tempRef,
                        rootDoc,
                        visitedRefs,
                        baseUrl
                    );
                    visitedRefs.delete(refValue);
                    return resolvedNested;
                }
                visitedRefs.delete(refValue);
            }
            return obj;
        }

        // Regular object with properties — recursively resolve each property
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === "object" && value !== null) {
                result[key] = await this.resolveNestedExternalReferences(value, rootDoc, visitedRefs, baseUrl);
            } else {
                result[key] = value;
            }
        }

        return result;
    }

    public getExamplesFromSchema({
        schema,
        breadcrumbs
    }: {
        schema: OpenAPIV3_1.SchemaObject | undefined;
        breadcrumbs: string[];
    }): unknown[] {
        if (schema == null) {
            return [];
        }
        const examples: unknown[] = schema.example != null ? [schema.example] : [];

        if (schema.examples != null) {
            if (Array.isArray(schema.examples)) {
                examples.push(...schema.examples);
            } else {
                this.errorCollector.collect({
                    message: "Received non-array schema examples",
                    path: breadcrumbs
                });
            }
        }
        return examples;
    }

    public getNamedExamplesFromMediaTypeObject({
        mediaTypeObject,
        breadcrumbs,
        defaultExampleName
    }: {
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject | undefined;
        breadcrumbs: string[];
        defaultExampleName?: string;
    }): Array<[string, unknown]> {
        if (mediaTypeObject == null) {
            return [];
        }
        const examples: Array<[string, unknown]> = [];
        if (mediaTypeObject.example != null) {
            const exampleName = this.generateUniqueName({
                prefix: defaultExampleName ?? `${breadcrumbs.join("_")}_example`,
                existingNames: []
            });
            examples.push([exampleName, mediaTypeObject.example]);
        }
        if (mediaTypeObject.examples != null) {
            examples.push(...Object.entries(mediaTypeObject.examples));
        }
        return examples;
    }

    public resolveMaybeReference<T>({
        schemaOrReference,
        breadcrumbs,
        skipErrorCollector
    }: {
        schemaOrReference: OpenAPIV3_1.ReferenceObject | T;
        breadcrumbs: string[];
        skipErrorCollector?: boolean;
    }): T | undefined {
        if (this.isReferenceObject(schemaOrReference)) {
            const resolved = this.resolveReference<T>({
                reference: schemaOrReference,
                breadcrumbs,
                skipErrorCollector
            });
            if (!resolved.resolved) {
                return undefined;
            }
            return resolved.value;
        }
        return schemaOrReference;
    }

    public resolveExample(example: unknown): unknown {
        if (!this.isReferenceObject(example)) {
            return example;
        }
        const resolved = this.resolveReference({ reference: example });
        return resolved.resolved ? this.returnExampleValue(resolved.value) : undefined;
    }

    public resolveExampleWithValue(example: unknown): unknown {
        if (!this.isReferenceObject(example)) {
            return this.returnExampleValue(example);
        }
        const resolved = this.resolveReference({ reference: example });
        return resolved.resolved ? this.returnExampleValue(resolved.value) : undefined;
    }

    public returnExampleValue(example: unknown): unknown {
        return this.isExampleWithValue(example) ? example.value : example;
    }

    public getPropertyAccess(
        schemaOrReference: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject
    ): ObjectPropertyAccess | undefined {
        let schema = schemaOrReference;

        while (this.isReferenceObject(schema)) {
            const resolved = this.resolveReference<OpenAPIV3_1.SchemaObject>({ reference: schema });
            if (!resolved.resolved) {
                return undefined;
            }
            schema = resolved.value;
        }

        // Check for readOnly/writeOnly in the current schema and any allOf schemas
        const { readOnly, writeOnly } = this.getReadOnlyWriteOnlyFromSchema(schema);

        if (readOnly && writeOnly) {
            return undefined;
        }

        if (readOnly) {
            return ObjectPropertyAccess.ReadOnly;
        }

        if (writeOnly) {
            return ObjectPropertyAccess.WriteOnly;
        }

        return undefined;
    }

    private getReadOnlyWriteOnlyFromSchema(schema: OpenAPIV3_1.SchemaObject): {
        readOnly: boolean;
        writeOnly: boolean;
    } {
        // Check allOf schemas for readOnly/writeOnly properties
        if (schema.allOf && schema.allOf.length > 0) {
            // Start with true and AND all allOf schemas together
            let allOfReadOnly = true;
            let allOfWriteOnly = true;

            for (const allOfSchema of schema.allOf) {
                let resolvedAllOfSchema = allOfSchema;

                // Resolve reference if needed
                if (this.isReferenceObject(allOfSchema)) {
                    const resolved = this.resolveReference<OpenAPIV3_1.SchemaObject>({ reference: allOfSchema });
                    if (!resolved.resolved) {
                        continue;
                    }
                    resolvedAllOfSchema = resolved.value;
                }

                // Recursively check for readOnly/writeOnly in allOf schemas
                const allOfResult = this.getReadOnlyWriteOnlyFromSchema(resolvedAllOfSchema);
                // AND within allOf: all schemas must agree for the property to be true
                allOfReadOnly = allOfReadOnly && allOfResult.readOnly;
                allOfWriteOnly = allOfWriteOnly && allOfResult.writeOnly;
            }

            return {
                readOnly: allOfReadOnly,
                writeOnly: allOfWriteOnly
            };
        } else {
            return { readOnly: Boolean(schema.readOnly), writeOnly: Boolean(schema.writeOnly) };
        }
    }

    public getAudiences({
        operation,
        breadcrumbs
    }: {
        operation: object;
        breadcrumbs: string[];
    }): string[] | undefined {
        const audiencesExtension = new Extensions.AudienceExtension({
            operation,
            breadcrumbs,
            context: this
        });
        const converted = audiencesExtension.convert();
        if (converted == null) {
            return undefined;
        }
        return converted.audiences;
    }

    public getAvailability({
        node,
        breadcrumbs
    }: {
        node:
            | OpenAPIV3_1.ReferenceObject
            | OpenAPIV3_1.SchemaObject
            | OpenAPIV3_1.OperationObject
            | OpenAPIV3_1.ParameterObject;
        breadcrumbs: string[];
    }): Availability | undefined {
        while (this.isReferenceObject(node)) {
            const resolved = this.resolveReference<OpenAPIV3_1.SchemaObject>({ reference: node });
            if (!resolved.resolved) {
                return undefined;
            }
            node = resolved.value;
        }

        const availabilityExtension = new Extensions.FernAvailabilityExtension({
            node,
            breadcrumbs,
            context: this
        });
        const availability = availabilityExtension.convert();
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

    public createNamedTypeReference(id: string, displayName?: string | undefined): TypeReference {
        return TypeReference.named({
            fernFilepath: {
                allParts: [],
                packagePath: [],
                file: undefined
            },
            name: this.casingsGenerator.generateName(id),
            typeId: id,
            displayName,
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
            name: this.casingsGenerator.generateName(typeId),
            displayName: typeReference.displayName
        };
    }

    public removeSchemaFromInlinedTypes({
        id,
        inlinedTypes
    }: {
        id: string;
        inlinedTypes: Record<TypeId, SchemaConverter.ConvertedSchema>;
    }): Record<TypeId, SchemaConverter.ConvertedSchema> {
        return Object.fromEntries(Object.entries(inlinedTypes).filter(([key]) => key !== id));
    }

    public static maybeTrimPrefix(value: string, prefix: string): string {
        if (value.startsWith(prefix)) {
            return value.slice(prefix.length);
        }
        return value;
    }

    public generateUniqueName({ prefix, existingNames }: { prefix: string; existingNames: string[] }): string {
        if (!existingNames.includes(prefix)) {
            return prefix;
        }
        let i = 0;
        while (existingNames.includes(`${prefix}_${i}`)) {
            i++;
        }
        return `${prefix}_${i}`;
    }

    public isReferenceObject(value: unknown): value is OpenAPIV3_1.ReferenceObject {
        return typeof value === "object" && value !== null && "$ref" in value;
    }

    public isExternalReference($ref: string): boolean {
        return typeof $ref === "string" && ($ref.startsWith("http://") || $ref.startsWith("https://"));
    }

    public isReferenceObjectWithIdentifier(
        value: unknown
    ): value is OpenAPIV3_1.ReferenceObject & { title?: string; name?: string; messageId?: string; summary?: string } {
        return (
            this.isReferenceObject(value) &&
            ("title" in value || "name" in value || "messageId" in value || "summary" in value)
        );
    }

    public isExampleWithSummary(example: unknown): example is { summary: string } {
        return typeof example === "object" && example != null && "summary" in example;
    }

    public isExampleWithValue(example: unknown): example is { value: unknown } {
        return typeof example === "object" && example != null && "value" in example;
    }

    /**
     * TypeReference helper methods to check various properties
     */
    public isOptional(
        valueType: TypeReference
    ): valueType is TypeReference.Container & { container: ContainerType.Optional } {
        return valueType.type === "container" && valueType.container.type === "optional";
    }

    public isNullable(
        valueType: TypeReference
    ): valueType is TypeReference.Container & { container: ContainerType.Nullable } {
        return valueType.type === "container" && valueType.container.type === "nullable";
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

    /**
     * Helper function to get a stringified group name from an array of group parts
     * @param groupParts Array of group name parts
     * @param namespace Optional namespace to prepend to the group
     * @returns A dot-separated string representation of the group
     */
    public getGroup({ groupParts, namespace }: { groupParts: string[] | undefined; namespace?: string }): string[] {
        const group = [];
        if (namespace != null) {
            group.push(namespace);
        }
        group.push(...(groupParts ?? []));
        return group;
    }

    public isObjectSchemaType(schema: OpenAPIV3_1.SchemaObject): boolean {
        return schema.type === "object" || schema.properties != null;
    }
}
