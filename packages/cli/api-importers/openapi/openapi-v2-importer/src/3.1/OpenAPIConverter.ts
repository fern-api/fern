import { FernIr, IntermediateRepresentation } from "@fern-api/ir-sdk";

import { AbstractConverter } from "../AbstractConverter";
import { ErrorCollector } from "../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "./OpenAPIConverterContext3_1";
import { SchemaConverter } from "./schema/SchemaConverter";

export type BaseIntermediateRepresentation = Omit<
    IntermediateRepresentation,
    "sdkConfig" | "subpackages" | "rootPackage" | "constants" | "auth" | "apiName"
>;

export class OpenAPIConverter extends AbstractConverter<OpenAPIConverterContext3_1, BaseIntermediateRepresentation> {
    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): BaseIntermediateRepresentation | undefined {
        const ir: BaseIntermediateRepresentation = {
            fdrApiDefinitionId: undefined,
            apiVersion: undefined,
            apiDisplayName: context.spec.info.title,
            apiDocs: context.spec.info.description,
            headers: [],
            idempotencyHeaders: [],
            types: {},
            services: {},
            webhookGroups: {},
            websocketChannels: undefined,
            errors: {},
            environments: undefined,
            basePath: undefined,
            pathParameters: [],
            errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode(),
            variables: [],
            serviceTypeReferenceInfo: {
                typesReferencedOnlyByService: {},
                sharedTypes: []
            },
            readmeConfig: undefined,
            sourceConfig: undefined,
            publishConfig: undefined,
            dynamic: undefined
        };

        // convert servers
        for (const server of context.spec.servers ?? []) {
        }

        // convert security schemes
        for (const [id, securityScheme] of Object.entries(context.spec.components?.securitySchemes ?? {})) {
        }

        // convert schemas
        for (const [id, schema] of Object.entries(context.spec.components?.schemas ?? {})) {
            const schemaConverter = new SchemaConverter({
                id,
                breadcrumbs: ["components", "schemas", id],
                schema
            });
            const convertedSchema = schemaConverter.convert({ context, errorCollector });
            if (convertedSchema != null) {
                ir.types = {
                    ...ir.types,
                    ...convertedSchema.inlinedTypes,
                    [id]: convertedSchema.typeDeclaration
                };
            }
        }

        // convert paths
        for (const [path, pathItem] of Object.entries(context.spec.paths ?? {})) {
        }

        // convert webhooks
        for (const [wpath, webhook] of Object.entries(context.spec.webhooks ?? {})) {
        }

        return ir;
    }
}
