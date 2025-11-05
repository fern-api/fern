import { Logger } from "@fern-api/logger";
import { Namespace, SdkGroup, SdkGroupName } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";

import { ParseOpenAPIOptions } from "../options";
import { SCHEMA_REFERENCE_PREFIX } from "../schema/convertSchemas";
import { SchemaParserContext } from "../schema/SchemaParserContext";
import { isReferenceObject } from "../schema/utils/isReferenceObject";
import { WebsocketSessionExampleMessage } from "./getFernExamples";
import { AsyncAPIV2 } from "./v2";
import { AsyncAPIV3 } from "./v3";

export abstract class AbstractAsyncAPIParserContext<TDocument extends object> implements SchemaParserContext {
    public readonly document: AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;
    public readonly taskContext: TaskContext;
    public readonly logger: Logger;
    public readonly DUMMY: SchemaParserContext;
    public readonly options: ParseOpenAPIOptions;
    public readonly namespace: string | undefined;

    protected static readonly MESSAGE_REFERENCE_PREFIX = "#/components/messages/";

    constructor({
        document,
        taskContext,
        options,
        namespace
    }: {
        document: AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;
        taskContext: TaskContext;
        options: ParseOpenAPIOptions;
        namespace: string | undefined;
    }) {
        this.document = document;
        this.taskContext = taskContext;
        this.logger = taskContext.logger;
        this.DUMMY = this; // used by the schema logic
        this.options = options;
        this.namespace = namespace;
    }

    /**
     * Merges the current namespace into the provided group name.
     */
    public resolveGroupName(groupName: SdkGroupName): SdkGroupName {
        if (this.namespace != null) {
            return [{ type: "namespace", name: this.namespace }, ...groupName];
        }
        return groupName;
    }

    /**
     * Produces the final tag list (namespace + operation tags).
     */
    public resolveTags(operationTags: string[] | undefined, fallback?: string): SdkGroup[] {
        if (this.namespace == null && operationTags == null && fallback != null) {
            return [fallback];
        }

        const tags: SdkGroup[] = [];
        if (this.namespace != null) {
            const namespaceSegment: Namespace = {
                type: "namespace",
                name: this.namespace
            };
            tags.push(namespaceSegment);
        }
        return tags.concat(operationTags ?? []);
    }

    /**
     * Resolves a schema reference of the form #/components/schemas/...
     * Shared logic across v2 and v3 specs, so long as the shape matches:
     *   this.document.components.schemas[...]
     */
    public resolveSchemaReference(schema: OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject {
        if (!schema.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
            throw new Error(`Failed to resolve schema reference: ${schema.$ref}`);
        }

        const schemaKey = schema.$ref.substring(SCHEMA_REFERENCE_PREFIX.length);
        const splitSchemaKey = schemaKey.split("/");

        const components = (this.document as AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3).components;
        if (components == null || components.schemas == null) {
            throw new Error("Document does not have components.schemas.");
        }

        const [topKey, maybeProps, maybePropKey] = splitSchemaKey;

        if (topKey == null || topKey === "") {
            throw new Error(`${schema.$ref} cannot be resolved. No schema key provided.`);
        }

        let resolvedSchema = components.schemas[topKey];
        if (resolvedSchema == null) {
            throw new Error(`Schema "${topKey}" is undefined in document.components.schemas.`);
        }

        if (isReferenceObject(resolvedSchema)) {
            resolvedSchema = this.resolveSchemaReference(resolvedSchema);
        }

        if (maybeProps === "properties" && maybePropKey != null) {
            const resolvedProperty = resolvedSchema.properties?.[maybePropKey];
            if (resolvedProperty == null) {
                throw new Error(`Property "${maybePropKey}" not found on "${topKey}". Full ref: ${schema.$ref}`);
            } else if (isReferenceObject(resolvedProperty)) {
                resolvedSchema = this.resolveSchemaReference(resolvedProperty);
            } else {
                resolvedSchema = resolvedProperty;
            }
        }

        return resolvedSchema;
    }

    public abstract getExampleMessageReference(message: WebsocketSessionExampleMessage): string;

    /**
     * Abstract: v2 vs v3 have different ways to handle message references.
     */
    public abstract resolveMessageReference(message: OpenAPIV3.ReferenceObject): unknown;

    /**
     * Generic helper to see if a $ref path is valid.
     */
    public referenceExists(ref: string): boolean {
        // Step 1: Get keys
        const keys = ref
            .substring(2)
            .split("/")
            .map((key) => key.replace(/~1/g, "/"));

        // Step 2: Index recursively into the document
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        let resolved: any = this.document;
        for (const key of keys) {
            if (typeof resolved !== "object" || resolved == null) {
                return false;
            }
            resolved = resolved[key];
        }
        return true;
    }

    /**
     * The following methods are no-ops by default, but are part of the SchemaParserContext interface.
     * If you need special logic, you can override them in your subclass.
     */
    public markSchemaAsReferencedByNonRequest(schemaId: string): void {
        return;
    }

    public markSchemaAsReferencedByRequest(schemaId: string): void {
        return;
    }

    public markReferencedByDiscriminatedUnion(
        schema: OpenAPIV3.ReferenceObject,
        discriminant: string,
        times: number
    ): void {
        return;
    }

    public markSchemaWithDiscriminantValue(
        schema: OpenAPIV3.ReferenceObject,
        discriminant: string,
        discriminantValue: string
    ): void {
        return;
    }
}
