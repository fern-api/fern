import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V22_TO_V21_MIGRATION: IrMigration<
    IrVersions.V22.ir.IntermediateRepresentation,
    IrVersions.V21.ir.IntermediateRepresentation
> = {
    laterVersion: "v22",
    earlierVersion: "v21",
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
        [GeneratorName.GO_FIBER]: "0.5.0-3-gac7ce7c",
        [GeneratorName.GO_MODEL]: "0.0.14-8-g2fa39f7",
        [GeneratorName.GO_SDK]: "0.0.14-8-g2fa39f7",
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
    migrateBackwards: (v22): IrVersions.V21.ir.IntermediateRepresentation => {
        return {
            ...v22,
            services: mapValues(v22.services, (service) => {
                return convertService(service);
            })
        };
    }
};

function convertService(service: IrVersions.V22.http.HttpService): IrVersions.V21.http.HttpService {
    return {
        ...service,
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint))
    };
}

function convertEndpoint(endpoint: IrVersions.V22.http.HttpEndpoint): IrVersions.V21.http.HttpEndpoint {
    return {
        ...endpoint,
        ...(endpoint.response != null
            ? IrVersions.V22.http.HttpResponse._visit<
                  Pick<IrVersions.V21.http.HttpEndpoint, "response" | "streamingResponse" | "sdkResponse">
              >(endpoint.response, {
                  json: (jsonResponse) => ({
                      response: IrVersions.V21.http.HttpResponse.json(jsonResponse),
                      streamingResponse: undefined,
                      sdkResponse: IrVersions.V21.http.SdkResponse.json(jsonResponse)
                  }),
                  fileDownload: (fileDownloadResponse) => ({
                      response: IrVersions.V21.http.HttpResponse.fileDownload(fileDownloadResponse),
                      streamingResponse: undefined,
                      sdkResponse: IrVersions.V21.http.SdkResponse.fileDownload(fileDownloadResponse)
                  }),
                  streaming: (streamingResponse) => ({
                      response: undefined,
                      streamingResponse,
                      sdkResponse: IrVersions.V21.http.SdkResponse.streaming(streamingResponse)
                  }),
                  _unknown: () => {
                      throw new Error("Unknown HttpResponse: " + endpoint.response?.type);
                  }
              })
            : {
                  response: undefined,
                  streamingResponse: undefined,
                  sdkResponse: undefined
              })
    };
}
