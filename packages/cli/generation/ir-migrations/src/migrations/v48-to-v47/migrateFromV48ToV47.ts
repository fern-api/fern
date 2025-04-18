import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V48_TO_V47_MIGRATION: IrMigration<
    IrVersions.V48.ir.IntermediateRepresentation,
    IrVersions.V47.ir.IntermediateRepresentation
> = {
    laterVersion: "v48",
    earlierVersion: "v47",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "0.29.0",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "0.29.0",
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.17.0",
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
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V47.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v48): IrVersions.V47.ir.IntermediateRepresentation => {
        const services = Object.fromEntries(
            Object.entries(v48.services).map(([serviceId, service]) => {
                const convertedEndpoints: IrVersions.V47.HttpEndpoint[] = service.endpoints.map((endpoint) => {
                    const convertedEndpoint = {
                        ...endpoint,
                        pagination: endpoint.pagination != null ? convertPagination(endpoint.pagination) : undefined
                    };
                    return convertedEndpoint;
                });
                return [
                    serviceId,
                    {
                        ...service,
                        endpoints: convertedEndpoints
                    }
                ];
            })
        );
        return {
            ...v48,
            sdkConfig: {
                ...v48.sdkConfig,
                hasPaginatedEndpoints: hasPaginatedEndpoints(services)
            },
            services
        };
    }
};

function hasPaginatedEndpoints(services: Record<string, IrVersions.V47.HttpService>): boolean {
    for (const service of Object.values(services)) {
        for (const endpoint of service.endpoints) {
            if (endpoint.pagination != null) {
                return true;
            }
        }
    }
    return false;
}

function convertPagination(pagination: IrVersions.V48.Pagination): IrVersions.V47.Pagination | undefined {
    switch (pagination.type) {
        case "cursor": {
            const cursorPagination = convertCursorPagination(pagination);
            return cursorPagination != null ? IrVersions.V47.Pagination.cursor(cursorPagination) : undefined;
        }
        case "offset": {
            const offsetPagination = convertOffsetPagination(pagination);
            return offsetPagination != null ? IrVersions.V47.Pagination.offset(offsetPagination) : undefined;
        }
        default:
            assertNever(pagination);
    }
}

function convertCursorPagination(
    pagination: IrVersions.V48.CursorPagination
): IrVersions.V47.CursorPagination | undefined {
    const page = convertRequestPropertyToQueryParameter(pagination.page);
    if (page == null) {
        return undefined;
    }
    return {
        ...pagination,
        page
    };
}

function convertOffsetPagination(
    pagination: IrVersions.V48.OffsetPagination
): IrVersions.V47.OffsetPagination | undefined {
    if (pagination.step != null) {
        // If the step property is present, we can't convert this pagination.
        return undefined;
    }
    const page = convertRequestPropertyToQueryParameter(pagination.page);
    if (page == null) {
        return undefined;
    }
    return {
        ...pagination,
        page
    };
}

function convertRequestPropertyToQueryParameter(
    requestProperty: IrVersions.V48.RequestProperty
): IrVersions.V47.QueryParameter | undefined {
    switch (requestProperty.property.type) {
        case "query":
            return requestProperty.property;
    }
    // If the property is not a query parameter, there's nothing for us to
    // convert it into. We drop the pagination functionality entirely, and
    // instead just generate the standard list endpoint.
    return undefined;
}
