import { GeneratorName } from "@fern-api/configuration-loader";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V26_TO_V25_MIGRATION: IrMigration<
    IrVersions.V26.ir.IntermediateRepresentation,
    IrVersions.V25.ir.IntermediateRepresentation
> = {
    laterVersion: "v26",
    earlierVersion: "v25",
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
        [GeneratorName.PYTHON_FASTAPI]: "0.5.0-rc2-16-g4177fafd",
        [GeneratorName.PYTHON_PYDANTIC]: "0.5.0-rc2-16-g4177fafd",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: "0.5.0-rc2-16-g4177fafd",
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V25.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip"
        }),
    migrateBackwards: (v26): IrVersions.V25.ir.IntermediateRepresentation => {
        return {
            ...v26,
            types: Object.fromEntries(
                Object.entries(v26.types).map(([key, val]) => {
                    return [key, convertTypeDeclaration(val)];
                })
            ),
            headers: v26.headers.map((header) => convertHeader(header)),
            webhookGroups: Object.fromEntries(
                Object.entries(v26.webhookGroups).map(([key, val]) => {
                    return [key, val.map((webhook) => convertWebhook(webhook))];
                })
            ),
            services: Object.fromEntries(
                Object.entries(v26.services).map(([key, val]) => {
                    return [key, convertHttpService(val)];
                })
            )
        };
    }
};

function convertWebhook(val: IrVersions.V26.Webhook): IrVersions.V25.Webhook {
    return {
        ...val,
        headers: val.headers.map((header) => convertHeader(header)),
        availability:
            val.availability == null
                ? {
                      status: IrVersions.V25.AvailabilityStatus.GeneralAvailability,
                      message: undefined
                  }
                : val.availability
    };
}

function convertHttpService(val: IrVersions.V26.HttpService): IrVersions.V25.HttpService {
    return {
        ...val,
        endpoints: val.endpoints.map((endpoint) => convertEndpoint(endpoint)),
        headers: val.headers.map((header) => convertHeader(header)),
        availability:
            val.availability == null
                ? {
                      status: IrVersions.V25.AvailabilityStatus.GeneralAvailability,
                      message: undefined
                  }
                : val.availability
    };
}

function convertEndpoint(val: IrVersions.V26.HttpEndpoint): IrVersions.V25.HttpEndpoint {
    return {
        ...val,
        headers: val.headers.map((header) => convertHeader(header)),
        queryParameters: val.queryParameters.map((query) => convertQueryParameter(query)),
        availability:
            val.availability == null
                ? {
                      status: IrVersions.V25.AvailabilityStatus.GeneralAvailability,
                      message: undefined
                  }
                : val.availability
    };
}

function convertHeader(val: IrVersions.V26.HttpHeader): IrVersions.V25.HttpHeader {
    return {
        ...val,
        availability:
            val.availability == null
                ? {
                      status: IrVersions.V25.AvailabilityStatus.GeneralAvailability,
                      message: undefined
                  }
                : val.availability
    };
}

function convertQueryParameter(val: IrVersions.V26.QueryParameter): IrVersions.V25.QueryParameter {
    return {
        ...val,
        availability:
            val.availability == null
                ? {
                      status: IrVersions.V25.AvailabilityStatus.GeneralAvailability,
                      message: undefined
                  }
                : val.availability
    };
}

function convertTypeDeclaration(val: IrVersions.V26.TypeDeclaration): IrVersions.V25.TypeDeclaration {
    return {
        ...val,
        shape: val.shape._visit<IrVersions.V25.Type>({
            union: (val) =>
                IrVersions.V25.Type.union({
                    ...val,
                    baseProperties: val.baseProperties.map((baseProperty) => convertObjectProperty(baseProperty))
                }),
            object: (val) =>
                IrVersions.V25.Type.object({
                    ...val,
                    properties: val.properties.map((property) => convertObjectProperty(property))
                }),
            enum: (val) =>
                IrVersions.V25.Type.enum({
                    ...val,
                    values: val.values.map((enumValue) => convertEnumValue(enumValue))
                }),
            alias: (val) => IrVersions.V25.Type.alias(val),
            undiscriminatedUnion: (val) => IrVersions.V25.Type.undiscriminatedUnion(val),
            _other: () => {
                throw new Error("Encountered unknown shape");
            }
        }),
        availability:
            val.availability == null
                ? {
                      status: IrVersions.V25.AvailabilityStatus.GeneralAvailability,
                      message: undefined
                  }
                : val.availability
    };
}

function convertObjectProperty(val: IrVersions.V26.ObjectProperty): IrVersions.V25.ObjectProperty {
    return {
        ...val,
        availability:
            val.availability == null
                ? {
                      status: IrVersions.V25.AvailabilityStatus.GeneralAvailability,
                      message: undefined
                  }
                : val.availability
    };
}

function convertEnumValue(val: IrVersions.V26.EnumValue): IrVersions.V25.EnumValue {
    return {
        ...val,
        availability:
            val.availability == null
                ? {
                      status: IrVersions.V25.AvailabilityStatus.GeneralAvailability,
                      message: undefined
                  }
                : val.availability
    };
}
