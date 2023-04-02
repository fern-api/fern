import { GeneratorName } from "@fern-api/generators-configuration";
import { mapValues } from "lodash-es";
import { IrVersions } from "../../ir-versions";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V16_TO_V15_MIGRATION: IrMigration<
    IrVersions.V16.ir.IntermediateRepresentation,
    IrVersions.V15.ir.IntermediateRepresentation
> = {
    laterVersion: "v16",
    earlierVersion: "v15",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: "0.5.4-1-g4e69d312",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.5.4-1-g4e69d312",
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA_SPRING]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: AlwaysRunMigration,
        [GeneratorName.PYTHON_PYDANTIC]: AlwaysRunMigration,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.STOPLIGHT]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
        [GeneratorName.PYTHON_SDK]: AlwaysRunMigration,
    },
    migrateBackwards: (v16, { taskContext, targetGenerator }): IrVersions.V15.ir.IntermediateRepresentation => {
        if (v16.basePath != null) {
            return taskContext.failAndThrow(
                targetGenerator != null
                    ? `Generator ${targetGenerator.name}@${targetGenerator.version}` +
                          " does not support specifying a base-path in api.yml." +
                          ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                          " to a compatible version."
                    : "Cannot backwards-migrate IR because this IR contains a root base-path."
            );
        }
        return {
            ...v16,
            services: mapValues(v16.services, (service) => ({
                ...service,
                pathParameters: convertPathParameters(service.pathParameters),
                endpoints: service.endpoints.map((endpoint) => ({
                    ...endpoint,
                    allPathParameters: convertPathParameters(endpoint.allPathParameters),
                    pathParameters: convertPathParameters(endpoint.pathParameters),
                })),
            })),
        };
    },
};

function convertPathParameters(
    pathParameters: IrVersions.V16.http.PathParameter[]
): IrVersions.V15.http.PathParameter[] {
    return pathParameters.map((pathParameter) => convertPathParameter(pathParameter));
}

function convertPathParameter(pathParameter: IrVersions.V16.http.PathParameter): IrVersions.V15.http.PathParameter {
    return {
        ...pathParameter,
        availability: {
            status: IrVersions.V15.commons.AvailabilityStatus.GeneralAvailability,
            message: undefined,
        },
    };
}
