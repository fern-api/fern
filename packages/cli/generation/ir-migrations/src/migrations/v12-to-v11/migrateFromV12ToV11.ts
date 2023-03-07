import { GeneratorName } from "@fern-api/generators-configuration";
import { mapValues } from "lodash-es";
import { IrVersions } from "../../ir-versions";
import { IrMigrationContext } from "../../IrMigrationContext";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V12_TO_V11_MIGRATION: IrMigration<
    IrVersions.V12.ir.IntermediateRepresentation,
    IrVersions.V11.ir.IntermediateRepresentation
> = {
    laterVersion: "v12",
    earlierVersion: "v11",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_EXPRESS]: AlwaysRunMigration,
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA_SPRING]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: AlwaysRunMigration,
        [GeneratorName.PYTHON_PYDANTIC]: AlwaysRunMigration,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
    },
    migrateBackwards: (v12, context): IrVersions.V11.ir.IntermediateRepresentation => {
        const hasUndiscriminatedUnions = Object.entries(v12.types).some(([_, typeDeclaration]) => {
            return typeDeclaration.shape._type === "undiscriminatedUnion";
        });
        if (hasUndiscriminatedUnions) {
            throw new Error("Upgrade your generator because it doesn't support undiscriminated unions");
        }

        const v11Types: Record<string, IrVersions.V11.types.TypeDeclaration> = {};
        Object.entries(v12.types).forEach(([typeName, typeDeclaration]) => {
            IrVersions.V12.types.Type._visit(typeDeclaration.shape, {
                union: (unionTypeDeclaration) => {
                    v11Types[typeName] = {
                        ...typeDeclaration,
                        shape: IrVersions.V11.types.Type.union({
                            ...unionTypeDeclaration,
                        }),
                    };
                },
                enum: (enumTypeDeclaration) => {
                    v11Types[typeName] = {
                        ...typeDeclaration,
                        shape: IrVersions.V11.types.Type.enum({
                            ...enumTypeDeclaration,
                        }),
                    };
                },
                object: (objectTypeDeclaration) => {
                    v11Types[typeName] = {
                        ...typeDeclaration,
                        shape: IrVersions.V11.types.Type.object({
                            ...objectTypeDeclaration,
                        }),
                    };
                },
                alias: (aliasTypeDeclaration) => {
                    IrVersions.V12.types.ResolvedTypeReference._visit(aliasTypeDeclaration.resolvedType, {
                        container: (containerType) => {
                            v11Types[typeName] = {
                                ...typeDeclaration,
                                shape: IrVersions.V11.types.Type.alias({
                                    resolvedType: IrVersions.V11.types.ResolvedTypeReference.container(containerType),
                                    aliasOf: aliasTypeDeclaration.aliasOf,
                                }),
                            };
                        },
                        primitive: (primitiveType) => {
                            v11Types[typeName] = {
                                ...typeDeclaration,
                                shape: IrVersions.V11.types.Type.alias({
                                    resolvedType: IrVersions.V11.types.ResolvedTypeReference.primitive(primitiveType),
                                    aliasOf: aliasTypeDeclaration.aliasOf,
                                }),
                            };
                        },
                        named: (namedType) => {
                            if (namedType.shape === "UNDISCRIMINATED_UNION") {
                                return;
                            } else {
                                v11Types[typeName] = {
                                    ...typeDeclaration,
                                    shape: IrVersions.V11.types.Type.alias({
                                        resolvedType: IrVersions.V11.types.ResolvedTypeReference.named({
                                            shape: namedType.shape,
                                            name: namedType.name,
                                        }),
                                        aliasOf: aliasTypeDeclaration.aliasOf,
                                    }),
                                };
                            }
                        },
                        unknown: () => {
                            v11Types[typeName] = {
                                ...typeDeclaration,
                                shape: IrVersions.V11.types.Type.alias({
                                    resolvedType: IrVersions.V11.types.ResolvedTypeReference.unknown(),
                                    aliasOf: aliasTypeDeclaration.aliasOf,
                                }),
                            };
                        },
                        _unknown: () => {
                            throw new Error("Encountered unknown shape");
                        },
                    });
                },
                undiscriminatedUnion: () => {
                    throw new Error("Upgrade your generator because it doesn't support undiscriminated unions");
                },
                _unknown: () => {
                    throw new Error("Encountered unknown shape");
                },
            });
        });

        IrVersions.V12.types.Type;

        return {
            ...v12,
            types: v11Types,
            services: mapValues(v12.services, (service) => convertService(service, context)),
        };
    },
};

function convertService(
    service: IrVersions.V12.http.HttpService,
    context: IrMigrationContext
): IrVersions.V11.http.HttpService {
    return {
        ...service,
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint, context)),
    };
}

function convertEndpoint(
    endpoint: IrVersions.V12.http.HttpEndpoint,
    { taskContext, targetGenerator }: IrMigrationContext
): IrVersions.V11.http.HttpEndpoint {
    if (endpoint.streamingResponse != null) {
        return taskContext.failAndThrow(
            `Generator ${targetGenerator.name}@${targetGenerator.version}` +
                " does not support streaming responses." +
                ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                " to a compatible version."
        );
    }

    return {
        ...endpoint,
        response:
            endpoint.response != null
                ? { docs: endpoint.response.docs, type: endpoint.response.responseBodyType }
                : { docs: undefined, type: undefined },
    };
}
