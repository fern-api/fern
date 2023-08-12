import { assertNever } from "@fern-api/core-utils";
import { GeneratorName } from "@fern-api/generators-configuration";
import * as IrV23Serialization from "@fern-fern/ir-sdk/serialization";
import { mapValues } from "lodash-es";
import { IrVersions } from "../../ir-versions";
import { IrMigrationContext } from "../../IrMigrationContext";
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
    serializeLaterVersion: IrV23Serialization.IntermediateRepresentation.jsonOrThrow,
    migrateBackwards: (v23, context): IrVersions.V22.ir.IntermediateRepresentation => {
        const v22Services: Record<IrVersions.V22.commons.ServiceId, IrVersions.V22.http.HttpService> = {};
        for (const [serviceId, service] of Object.entries(v23.services)) {
            const v22Endpoints: IrVersions.V22.http.HttpEndpoint[] = [];
            for (const endpoint of service.endpoints) {
                const convertedEndpoint = convertEndpoint(endpoint, context);
                v22Endpoints.push(convertedEndpoint);
            }
            v22Services[serviceId] = {
                ...service,
                endpoints: v22Endpoints,
                headers: service.headers.map((header) => convertHeader(header)),
                pathParameters: service.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
            };
        }
        return {
            ...v23,
            auth: {
                ...v23.auth,
                schemes: v23.auth.schemes.map((scheme) => convertAuthScheme(scheme)),
            },
            headers: v23.headers.map((header) => convertHeader(header)),
            types: mapValues(v23.types, (type) => convertType(type)),
            services: v22Services,
            errors: mapValues(v23.errors, (error) => convertError(error)),
            subpackages: mapValues(v23.subpackages, (subpackage) => convertSubpackage(subpackage)),
            pathParameters: v23.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
            variables: v23.variables.map((variable) => convertVariable(variable)),
        };
    },
};

function convertEndpoint(
    endpoint: IrVersions.V23.http.HttpEndpoint,
    context: IrMigrationContext
): IrVersions.V22.http.HttpEndpoint {
    return {
        ...endpoint,
        headers: endpoint.headers.map((header) => convertHeader(header)),
        pathParameters: endpoint.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        allPathParameters: endpoint.allPathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        queryParameters: endpoint.queryParameters.map((queryParameter) => convertQueryParameter(queryParameter)),
        requestBody: endpoint.requestBody != null ? convertRequestBody(endpoint.requestBody, context) : undefined,
        sdkRequest:
            endpoint.sdkRequest != null
                ? {
                      requestParameterName: endpoint.sdkRequest.requestParameterName,
                      shape: convertSdkRequestShape(endpoint.sdkRequest.shape),
                  }
                : undefined,
        response: endpoint.response != null ? convertResponse(endpoint.response) : undefined,
        examples: endpoint.examples.map((exampleEndpointCall) => convertExampleEndpointCall(exampleEndpointCall)),
    };
}

function convertRequestBody(
    requestBody: IrVersions.V23.http.HttpRequestBody,
    { taskContext, targetGenerator }: IrMigrationContext
): IrVersions.V22.http.HttpRequestBody {
    switch (requestBody.type) {
        case "bytes":
            return taskContext.failAndThrow(
                targetGenerator != null
                    ? `Generator ${targetGenerator.name}@${targetGenerator.version}` +
                          " does not support bytes requests."
                    : "Cannot backwards-migrate IR because this IR contains bytes requests."
            );
        case "fileUpload":
            return IrVersions.V22.http.HttpRequestBody.fileUpload({
                ...requestBody,
                properties: requestBody.properties.map((property) => convertFileUploadRequestBodyProperty(property)),
            });
        case "inlinedRequestBody":
            return IrVersions.V22.http.HttpRequestBody.inlinedRequestBody({
                ...requestBody,
                properties: requestBody.properties.map((property) => convertInlinedRequestBodyProperty(property)),
            });
        case "reference":
            return IrVersions.V22.http.HttpRequestBody.reference({
                ...requestBody,
                requestBodyType: convertTypeReference(requestBody.requestBodyType),
            });
        default:
            assertNever(requestBody);
    }
}

function convertHeader(header: IrVersions.V23.HttpHeader): IrVersions.V22.commons.HttpHeader {}
