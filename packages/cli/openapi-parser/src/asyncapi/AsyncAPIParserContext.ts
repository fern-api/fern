import { Logger } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { SCHEMA_REFERENCE_PREFIX } from "../schema/convertSchemas";
import { SchemaParserContext } from "../schema/SchemaParserContext";
import { isReferenceObject } from "../schema/utils/isReferenceObject";
import { AsyncAPIV2 } from "./v2";

const MESSAGE_REFERENCE_PREFIX = "#/components/messages/";

export abstract class AbstractAsyncAPIV2ParserContext implements SchemaParserContext {
    public logger: Logger;
    public document: AsyncAPIV2.Document;
    public taskContext: TaskContext;
    public DUMMY: SchemaParserContext;

    constructor({ document, taskContext }: { document: AsyncAPIV2.Document; taskContext: TaskContext }) {
        this.document = document;
        this.taskContext = taskContext;
        this.logger = taskContext.logger;
        this.DUMMY = this;
    }

    public resolveSchemaReference(schema: OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject {
        if (
            this.document.components == null ||
            this.document.components.schemas == null ||
            !schema.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)
        ) {
            throw new Error(`Failed to resolve ${schema.$ref}`);
        }
        const schemaKey = schema.$ref.substring(SCHEMA_REFERENCE_PREFIX.length);
        const splitSchemaKey = schemaKey.split("/");
        if (splitSchemaKey[0] == null) {
            throw new Error(`${schema.$ref} is undefined`);
        }
        let resolvedSchema = this.document.components.schemas[splitSchemaKey[0]];
        if (resolvedSchema == null) {
            throw new Error(`${splitSchemaKey[0]} is undefined`);
        }
        if (isReferenceObject(resolvedSchema)) {
            resolvedSchema = this.resolveSchemaReference(resolvedSchema);
        }

        if (splitSchemaKey[1] === "properties" && splitSchemaKey[2] != null) {
            const resolvedProperty = resolvedSchema.properties?.[splitSchemaKey[2]];
            if (resolvedProperty == null) {
                throw new Error(`${schema.$ref} is undefiened. Property does not exist on object.`);
            } else if (isReferenceObject(resolvedProperty)) {
                resolvedSchema = this.resolveSchemaReference(resolvedProperty);
            } else {
                resolvedSchema = resolvedProperty;
            }
        }

        return resolvedSchema;
    }

    public resolveMessageReference(message: OpenAPIV3.ReferenceObject): AsyncAPIV2.Message {
        if (
            this.document.components == null ||
            this.document.components.messages == null ||
            !message.$ref.startsWith(MESSAGE_REFERENCE_PREFIX)
        ) {
            throw new Error(`Failed to resolve ${message.$ref}`);
        }
        const messageKey = message.$ref.substring(MESSAGE_REFERENCE_PREFIX.length);
        const resolvedMessage = this.document.components.messages[messageKey];
        if (resolvedMessage == null) {
            throw new Error(`${message.$ref}  is undefined`);
        }
        return resolvedMessage;
    }

    public abstract markSchemaAsReferencedByNonRequest(schemaId: string): void;

    public abstract markSchemaAsReferencedByRequest(schemaId: string): void;

    public abstract markReferencedByDiscriminatedUnion(
        schema: OpenAPIV3.ReferenceObject,
        discrminant: string,
        times: number
    ): void;
}

export class AsyncAPIV2ParserContext extends AbstractAsyncAPIV2ParserContext {
    constructor({ document, taskContext }: { document: AsyncAPIV2.Document; taskContext: TaskContext }) {
        super({ document, taskContext });
    }

    markSchemaAsReferencedByNonRequest(schemaId: string): void {
        return;
    }

    markSchemaAsReferencedByRequest(schemaId: string): void {
        return;
    }

    markReferencedByDiscriminatedUnion(schema: OpenAPIV3.ReferenceObject, discrminant: string, times: number): void {
        return;
    }
}
