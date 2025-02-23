import { FernIr, HttpEndpoint, IntermediateRepresentation } from "@fern-api/ir-sdk";

import { constructHttpPath } from "@fern-api/ir-utils";
import { AbstractConverter } from "../AbstractConverter";
import { ErrorCollector } from "../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "./OpenAPIConverterContext3_1";
import { PathConverter } from "./paths/PathConverter";
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
            const groupToEndpoints: Record<string, HttpEndpoint[]>  = {};
            if (pathItem == null) {
                continue;
            }
            const pathConverter = new PathConverter({
                breadcrumbs: ["paths", path],
                pathItem,
                path,
            });
            const convertedPath = pathConverter.convert({ context, errorCollector });
            if (convertedPath != null) {
                for (const endpoint of convertedPath.endpoints) {
                    const group = endpoint.group?.join(".") ?? "";
                    if (groupToEndpoints[group] == null) {
                        groupToEndpoints[group] = [];
                    }
                    groupToEndpoints[group].push(endpoint.endpoint);
                }
            }
            for (const [group, endpoints] of Object.entries(groupToEndpoints)) {
                const allParts = group.split(".").map((part) => context.casingsGenerator.generateName(part));
                const finalpart = allParts[allParts.length - 1] ?? context.casingsGenerator.generateName("");
                ir.services[group] = {
                    name: {
                        fernFilepath: {
                            allParts,
                            packagePath: allParts.slice(0, -1),
                            file: finalpart
                        }
                    },
                    displayName: undefined,
                    basePath: constructHttpPath(""),
                    headers: [],
                    pathParameters: [],
                    availability: undefined,
                    endpoints,
                    transport: undefined,
                    encoding: undefined
                };
            }
        }

        // convert webhooks
        for (const [wpath, webhook] of Object.entries(context.spec.webhooks ?? {})) {
        }

        return ir;
    }
}
