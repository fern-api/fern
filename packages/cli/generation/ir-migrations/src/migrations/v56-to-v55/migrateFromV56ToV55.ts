import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V56_TO_V55_MIGRATION: IrMigration<
    IrVersions.V56.ir.IntermediateRepresentation,
    IrVersions.V55.ir.IntermediateRepresentation
> = {
    laterVersion: "v56",
    earlierVersion: "v55",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "0.47.0",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "0.47.0",
        [GeneratorName.TYPESCRIPT]: "0.47.0",
        [GeneratorName.TYPESCRIPT_SDK]: "0.47.0",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.17.7",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: "1.7.0",
        [GeneratorName.JAVA_SDK]: "2.16.0",
        [GeneratorName.JAVA_SPRING]: "1.5.0",
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
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: "1.10.1",
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: "0.3.2"
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V55.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v56): IrVersions.V55.ir.IntermediateRepresentation => {
        return {
            ...v56,
            services: mapValues(v56.services, (service) => convertHttpService(service))
        };
    }
};

function convertHttpService(service: IrVersions.V56.http.HttpService): IrVersions.V55.http.HttpService {
    return {
        ...service,
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint))
    };
}

function convertEndpoint(endpoint: IrVersions.V56.http.HttpEndpoint): IrVersions.V55.http.HttpEndpoint {
    return {
        ...endpoint,
        pagination: endpoint.pagination != null ? convertPagination(endpoint.pagination) : undefined
    };
}

function convertPagination(pagination: IrVersions.V56.http.Pagination): IrVersions.V55.http.Pagination | undefined {
    switch (pagination.type) {
        case "cursor":
            return pagination;
        case "offset":
            return pagination;
        case "custom":
            return undefined;
        default:
            assertNever(pagination);
    }
}
