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
        return {
            ...v12,
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
