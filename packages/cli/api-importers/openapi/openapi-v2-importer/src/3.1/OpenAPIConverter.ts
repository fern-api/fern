import { FernIr, HttpEndpoint, IntermediateRepresentation } from "@fern-api/ir-sdk";

import { constructHttpPath } from "@fern-api/ir-utils";
import { AbstractConverter } from "../AbstractConverter";
import { ErrorCollector } from "../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "./OpenAPIConverterContext3_1";
import { PathConverter } from "./paths/PathConverter";
import { SchemaConverter } from "./schema/SchemaConverter";

export type BaseIntermediateRepresentation = Omit<
    IntermediateRepresentation,  "apiName" | "constants"
>;

export declare namespace OpenAPIConverter {
    export interface Args extends AbstractConverter.Args {
        context: OpenAPIConverterContext3_1;
    }
}

export class OpenAPIConverter extends AbstractConverter<OpenAPIConverterContext3_1, IntermediateRepresentation> {

    private ir: BaseIntermediateRepresentation;

    constructor({ breadcrumbs, context }: OpenAPIConverter.Args) {
        super({ breadcrumbs });
        this.ir = {
            auth: {
                docs: undefined,
                requirement: FernIr.AuthSchemesRequirement.All,
                schemes: [],
            },
            types: {},
            services: {},
            errors: {},
            webhookGroups: {},
            websocketChannels: undefined,
            headers: [],
            idempotencyHeaders: [],
            apiVersion: undefined,
            apiDisplayName: undefined,
            apiDocs: undefined,
            basePath: undefined,
            pathParameters: [],
            errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode(),
            variables: [],
            serviceTypeReferenceInfo: {
                sharedTypes: [],
                typesReferencedOnlyByService: {}
            },
            readmeConfig: undefined,
            sourceConfig: undefined,
            publishConfig: undefined,
            dynamic: undefined,
            environments: undefined,
            fdrApiDefinitionId: undefined,
            rootPackage: context.createPackage(),
            subpackages: {},
            sdkConfig: {
                hasFileDownloadEndpoints: false,
                hasPaginatedEndpoints: false,
                hasStreamingEndpoints: false,
                isAuthMandatory: true,
                platformHeaders: {
                    language: "",
                    sdkName: "",
                    sdkVersion: "",
                    userAgent: undefined,
                }
            }
        };
    }


    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): IntermediateRepresentation {
        // convert servers
        for (const server of context.spec.servers ?? []) {
        }

        // convert security schemes
        for (const [id, securityScheme] of Object.entries(context.spec.components?.securitySchemes ?? {})) {
        }

        // convert schemas
        this.convertSchemas({ context, errorCollector });

        // convert paths
        this.convertPaths({ context, errorCollector });

        const toRet = {
            ...this.ir,
            apiName: context.casingsGenerator.generateName(this.ir.apiDisplayName ?? ""),
            constants: {
                errorInstanceIdKey: context.casingsGenerator.generateNameAndWireValue({
                    wireValue: "errorInstanceId",
                    name: "errorInstanceId"
                })
            }
        }
        return toRet;
    }

    private convertSchemas({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): void {
        for (const [id, schema] of Object.entries(context.spec.components?.schemas ?? {})) {
            const schemaConverter = new SchemaConverter({
                id,
                breadcrumbs: ["components", "schemas", id],
                schema
            });
            const convertedSchema = schemaConverter.convert({ context, errorCollector });
            if (convertedSchema != null) {
                this.ir.rootPackage.types.push(id);
                this.ir.types = {
                    ...this.ir.types,
                    ...convertedSchema.inlinedTypes,
                    [id]: convertedSchema.typeDeclaration
                };
            }
        }
        
    }

    private convertPaths({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): void {
        const groupToEndpoints: Record<string, HttpEndpoint[]> = {};
        
        for (const [path, pathItem] of Object.entries(context.spec.paths ?? {})) {
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
                this.ir.types = {
                    ...this.ir.types,
                    ...convertedPath.inlinedTypes
                };
            }
        }

        for (const [group, endpoints] of Object.entries(groupToEndpoints)) {
            const allParts = group.split(".").map((part) => context.casingsGenerator.generateName(part));
            const finalpart = allParts[allParts.length - 1] ?? context.casingsGenerator.generateName("");
            this.ir.services[group] = {
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

            if (group !== "") {
                if (this.ir.subpackages[group] == null) {
                    this.ir.subpackages[group] = {
                        name: context.casingsGenerator.generateName(group),
                        ...context.createPackage({ name: group }),
                    }
                }
                this.ir.subpackages[group].service = group;
                this.ir.rootPackage.subpackages.push(group);
            } else {
                this.ir.rootPackage.service = group;
            }
        }
    }
}
