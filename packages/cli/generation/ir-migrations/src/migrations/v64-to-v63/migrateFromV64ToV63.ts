import { GeneratorName } from "@fern-api/configuration-loader";
import { mapValues } from "lodash-es";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V64_TO_V63_MIGRATION: IrMigration<
    IrVersions.V64.ir.IntermediateRepresentation,
    IrVersions.V63.ir.IntermediateRepresentation
> = {
    laterVersion: "v64",
    earlierVersion: "v63",
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
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V63.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        }),
    migrateBackwards: (v64: IrVersions.V64.IntermediateRepresentation): IrVersions.V63.ir.IntermediateRepresentation => {
        return {
            ...v64,
            services: mapValues(v64.services, (service) => convertHttpService(service))
        };
    }
};

function convertHttpService(service: IrVersions.V64.HttpService): IrVersions.V63.http.HttpService {
    return {
        ...service,
        endpoints: service.endpoints.map((endpoint) => convertHttpEndpoint(endpoint))
    };
}

function convertHttpEndpoint(endpoint: IrVersions.V64.HttpEndpoint): IrVersions.V63.http.HttpEndpoint {
    return {
        ...endpoint,
        pagination: endpoint.pagination != null ? convertPagination(endpoint.pagination) : undefined
    };
}

function convertPagination(pagination: IrVersions.V64.Pagination): IrVersions.V63.http.Pagination {
    switch (pagination.type) {
        case "cursor":
            return IrVersions.V63.http.Pagination.cursor({
                page: convertRequestLocatorToRequestProperty(pagination.page),
                next: pagination.next,
                results: pagination.results
            });
        case "offset":
            return IrVersions.V63.http.Pagination.offset(pagination);
        case "custom":
            return IrVersions.V63.http.Pagination.custom(pagination);
    }
}

function convertRequestLocatorToRequestProperty(
    locator: IrVersions.V64.RequestLocator
): IrVersions.V63.http.RequestProperty {
    switch (locator.type) {
        case "property":
            return {
                propertyPath: locator.propertyPath,
                property: locator.property
            };
        case "uri":
        case "path":
            throw new Error(
                `CursorPagination with '${locator.type}' locator cannot be migrated to IR v63. ` +
                    `Only 'property' locators are supported in v63.`
            );
    }
}
