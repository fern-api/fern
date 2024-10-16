import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Logger } from "@fern-api/logger";
import { OpenApiIntermediateRepresentation, Schema, SchemaId, SchemaWithExample } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { FernDefinitionBuilder, FernDefinitionBuilderImpl } from "@fern-api/importer-commons";
import { isSchemaEqual } from "@fern-api/openapi-ir-parser";

export interface OpenApiIrConverterContextOpts {
    taskContext: TaskContext;
    ir: OpenApiIntermediateRepresentation;

    /**
     * If true, each error will be made unique per endpoint. This is the preferred behavior for Docs.
     * If false, error codes will be shared across endpoints. The side effect is that if more than one error schema is detected for each error code, then the error schema will default to unknown. This is the preferred behavior for SDKs.
     */
    enableUniqueErrorsPerEndpoint: boolean;

    /**
     * If true, the converter will detect frequently headers and add extract them as global headers within
     * the IR. This is primarily used for generating SDKs, but disabled for docs as it allows the documentation
     */
    detectGlobalHeaders: boolean;

    authOverrides?: RawSchemas.WithAuthSchema;

    environmentOverrides?: RawSchemas.WithEnvironmentsSchema;

    globalHeaderOverrides?: RawSchemas.WithHeadersSchema;

    /**
     * If true, the converter will inline types.
     */
    shouldInlineTypes: boolean;
}

export class OpenApiIrConverterContext {
    public logger: Logger;
    public taskContext: TaskContext;
    public ir: OpenApiIntermediateRepresentation;
    public builder: FernDefinitionBuilder;
    public environmentOverrides: RawSchemas.WithEnvironmentsSchema | undefined;
    public authOverrides: RawSchemas.WithAuthSchema | undefined;
    public globalHeaderOverrides: RawSchemas.WithHeadersSchema | undefined;
    public detectGlobalHeaders: boolean;
    private shouldInlineTypes: boolean;
    private inliningDisabled: boolean;
    private enableUniqueErrorsPerEndpoint: boolean;
    private defaultServerName: string | undefined = undefined;
    private unknownSchema: Set<number> = new Set();

    constructor({
        taskContext,
        ir,
        enableUniqueErrorsPerEndpoint,
        detectGlobalHeaders,
        environmentOverrides,
        globalHeaderOverrides,
        authOverrides,
        shouldInlineTypes
    }: OpenApiIrConverterContextOpts) {
        this.logger = taskContext.logger;
        this.taskContext = taskContext;
        this.ir = ir;
        this.enableUniqueErrorsPerEndpoint = enableUniqueErrorsPerEndpoint;
        this.builder = new FernDefinitionBuilderImpl(enableUniqueErrorsPerEndpoint);
        if (ir.title != null) {
            this.builder.setDisplayName({ displayName: ir.title });
        }
        this.detectGlobalHeaders = detectGlobalHeaders;
        this.environmentOverrides = environmentOverrides;
        this.authOverrides = authOverrides;
        this.globalHeaderOverrides = globalHeaderOverrides;
        this.shouldInlineTypes = shouldInlineTypes;
        this.inliningDisabled = false;
        this.logger.error("shouldInlineTypes", `${shouldInlineTypes}`);

        const schemaByStatusCode: Record<number, Schema> = {};
        if (!this.enableUniqueErrorsPerEndpoint) {
            for (const endpoint of ir.endpoints) {
                for (const [statusCodeString, error] of Object.entries(endpoint.errors)) {
                    const statusCode = parseInt(statusCodeString);
                    const existingSchema = schemaByStatusCode[statusCode];
                    if (existingSchema == null && error.schema != null) {
                        schemaByStatusCode[statusCode] = error.schema;
                    } else if (
                        existingSchema != null &&
                        error.schema != null &&
                        isSchemaEqual(existingSchema, error.schema)
                    ) {
                        // pass
                    } else {
                        this.unknownSchema.add(statusCode);
                    }
                }
            }
        }
    }

    public disableInlining(): void {
        this.inliningDisabled = true;
    }

    public undisableInlining(): void {
        this.inliningDisabled = false;
    }

    public shouldInline(): boolean {
        return !this.inliningDisabled && this.shouldInlineTypes;
    }

    public getSchema(id: SchemaId, namespace: string | undefined): Schema | undefined {
        if (namespace == null) {
            return this.ir.groupedSchemas.rootSchemas[id];
        }

        return this.ir.groupedSchemas.namespacedSchemas[namespace]?.[id];
    }

    /**
     * Returns the default server URL. This URL should only be set for multi-url cases.
     */
    public getDefaultServerName(): string | undefined {
        return this.defaultServerName;
    }

    /**
     * Sets the default server URL. This URL should only be set for multi-url cases.
     */
    public setDefaultServerName(name: string): void {
        this.defaultServerName = name;
    }

    /**
     * Is error an unknown schema
     */
    public isErrorUnknownSchema(statusCode: number): boolean {
        return this.unknownSchema.has(statusCode);
    }
}
