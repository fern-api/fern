import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V16_TO_V15_MIGRATION: IrMigration<
    IrVersions.V16.ir.IntermediateRepresentation,
    IrVersions.V15.ir.IntermediateRepresentation
> = {
    laterVersion: "v16",
    earlierVersion: "v15",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "0.5.4-1-g4e69d312",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.5.4-1-g4e69d312",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: "0.3.8-rc6-1-gcf4b372",
        [GeneratorName.JAVA_SDK]: "0.3.8-rc6-1-gcf4b372",
        [GeneratorName.JAVA_SPRING]: "0.3.8-rc6-1-gcf4b372",
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) => ir,
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
                    pathParameters: convertPathParameters(endpoint.pathParameters)
                }))
            }))
        };
    }
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
            message: undefined
        }
    };
}
