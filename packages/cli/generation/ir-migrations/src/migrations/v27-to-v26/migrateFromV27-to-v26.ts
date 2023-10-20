import { GeneratorName } from "@fern-api/generators-configuration";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V27_TO_V26_MIGRATION: IrMigration<
    IrVersions.V27.ir.IntermediateRepresentation,
    IrVersions.V26.ir.IntermediateRepresentation
> = {
    laterVersion: "v27",
    earlierVersion: "v26",
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
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V26.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
        }),
    migrateBackwards: (v27): IrVersions.V26.ir.IntermediateRepresentation => {
        return {
            ...v27,
            services: Object.fromEntries(
                Object.entries(v27.services).map(([key, val]) => {
                    return [key, convertHttpService(val)];
                })
            ),
        };
    },
};

function convertHttpService(val: IrVersions.V27.HttpService): IrVersions.V26.HttpService {
    return {
        ...val,
        endpoints: val.endpoints.map((endpoint) => convertHttpEndpoint(endpoint)),
    };
}

function convertHttpEndpoint(val: IrVersions.V27.HttpEndpoint): IrVersions.V26.HttpEndpoint {
    return {
        ...val,
        response: val.response != null ? convertHttpResponse(val.response) : undefined,
    };
}

function convertHttpResponse(val: IrVersions.V27.HttpResponse): IrVersions.V26.HttpResponse {
    if (val.type !== "json") {
        return val;
    }
    const jsonResponse = val.value;
    if (jsonResponse.type === "response") {
        return IrVersions.V26.HttpResponse.json(jsonResponse);
    }
    return IrVersions.V26.HttpResponse.json({
        docs: jsonResponse.docs,
        responseBodyType: jsonResponse.responseBodyType,
    });
}
