import { assertNever } from "@fern-api/core-utils";
import { GeneratorName } from "@fern-api/generators-configuration";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V23_TO_V22_MIGRATION: IrMigration<
    IrVersions.V23.ir.IntermediateRepresentation,
    IrVersions.V22.ir.IntermediateRepresentation
> = {
    laterVersion: "v23",
    earlierVersion: "v22",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
    },
    migrateBackwards: (v23, { taskContext, targetGenerator }): IrVersions.V22.ir.IntermediateRepresentation => {
        const v22Services: Record<IrVersions.V22.commons.ServiceId, IrVersions.V22.http.HttpService> = {};
        for (const [serviceId, service] of Object.entries(v23.services)) {
            const v22Endpoints: IrVersions.V22.http.HttpEndpoint[] = [];
            for (const endpoint of service.endpoints) {
                const convertedEndpoint = convertEndpoint(endpoint);
                if (convertedEndpoint == null) {
                    return taskContext.failAndThrow(
                        targetGenerator != null
                            ? `Generator ${targetGenerator.name}@${targetGenerator.version}` +
                                  " does not support bytes requests."
                            : "Cannot backwards-migrate IR because this IR contains bytes requests."
                    );
                }
                v22Endpoints.push(convertedEndpoint);
            }
            v22Services[serviceId] = {
                ...service,
                endpoints: v22Endpoints,
            };
        }
        return {
            ...v23,
            services: v22Services,
        };
    },
};

function convertEndpoint(endpoint: IrVersions.V23.http.HttpEndpoint): IrVersions.V22.http.HttpEndpoint | undefined {
    if (endpoint.requestBody == null) {
        return {
            ...endpoint,
            requestBody: undefined,
        };
    }
    switch (endpoint.requestBody.type) {
        case "bytes":
            return undefined;
        case "fileUpload":
            return {
                ...endpoint,
                requestBody: IrVersions.V22.http.HttpRequestBody.fileUpload({
                    ...endpoint.requestBody,
                }),
            };
        case "inlinedRequestBody":
            return {
                ...endpoint,
                requestBody: IrVersions.V22.http.HttpRequestBody.inlinedRequestBody({
                    ...endpoint.requestBody,
                }),
            };
        case "reference":
            return {
                ...endpoint,
                requestBody: IrVersions.V22.http.HttpRequestBody.reference({
                    ...endpoint.requestBody,
                }),
            };
        default:
            assertNever(endpoint.requestBody);
    }
}
