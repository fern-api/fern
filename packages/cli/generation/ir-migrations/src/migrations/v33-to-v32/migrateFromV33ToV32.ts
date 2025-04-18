import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V33_TO_V32_MIGRATION: IrMigration<
    IrVersions.V33.ir.IntermediateRepresentation,
    IrVersions.V32.ir.IntermediateRepresentation
> = {
    laterVersion: "v33",
    earlierVersion: "v32",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "0.12.0",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "0.12.0",
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
        [GeneratorName.GO_FIBER]: "0.13.0-3-g8c56a41",
        [GeneratorName.GO_MODEL]: "0.13.0-3-g8c56a41",
        [GeneratorName.GO_SDK]: "0.13.0-3-g8c56a41",
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: "0.0.0",
        [GeneratorName.CSHARP_SDK]: "0.0.0",
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V32.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v33): IrVersions.V32.ir.IntermediateRepresentation => {
        const converter = new Converter(v33);
        return {
            ...v33,
            services: Object.fromEntries(
                Object.entries(v33.services).map(([serviceId, service]) => {
                    return [
                        serviceId,
                        {
                            ...service,
                            endpoints: service.endpoints.map((endpoint) => converter.convertEndpoint(endpoint))
                        }
                    ];
                })
            )
        };
    }
};

class Converter {
    private ir: IrVersions.V33.ir.IntermediateRepresentation;

    constructor(ir: IrVersions.V33.ir.IntermediateRepresentation) {
        this.ir = ir;
    }

    public convertEndpoint(endpoint: IrVersions.V33.HttpEndpoint): IrVersions.V32.HttpEndpoint {
        return {
            ...endpoint,
            queryParameters: endpoint.queryParameters.map(
                // Object based query parameters are reverse migrated to optional string query parameters.
                (queryParameter) =>
                    this.isTypeReferenceObject(queryParameter.valueType)
                        ? {
                              ...queryParameter,
                              valueType: IrVersions.V33.TypeReference.container(
                                  IrVersions.V33.ContainerType.optional(
                                      IrVersions.V33.TypeReference.primitive("STRING")
                                  )
                              )
                          }
                        : queryParameter
            ),
            examples: convertExamples({
                examples: endpoint.examples,
                convert: convertExampleEndpointCall
            })
        };
    }

    private isTypeReferenceObject(typeReference: IrVersions.V33.TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                return this.isContainerObject(typeReference.container);
            case "named":
                return this.isNamedTypeObject(typeReference);
            case "primitive":
                return false;
            case "unknown":
                return true;
            default:
                assertNever(typeReference);
        }
    }

    private isContainerObject(containerType: IrVersions.V33.ContainerType): boolean {
        switch (containerType.type) {
            case "map":
            case "list":
            case "set":
                return true;
            case "optional":
                return this.isTypeReferenceObject(containerType.optional);
            case "literal":
                return false;
            default:
                assertNever(containerType);
        }
    }

    private isNamedTypeObject(exampleNamedType: IrVersions.V33.DeclaredTypeName): boolean {
        const typeDeclaration = this.ir.types[exampleNamedType.typeId];
        if (typeDeclaration == null) {
            // Best effort: the IR did not register this type, so we should remove it.
            return true;
        }
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.isTypeReferenceObject(typeDeclaration.shape.aliasOf);
            case "enum":
                return false;
            case "object":
            case "union":
            case "undiscriminatedUnion":
                return true;
            default:
                assertNever(typeDeclaration.shape);
        }
    }
}

function convertExamples<V33, V32>({
    examples,
    convert
}: {
    examples: V33[];
    convert: (val: V33) => V32 | undefined;
}): V32[] {
    const convertedExamples = [];
    for (const example of examples) {
        const convertedExampleEndpointCall = convert(example);
        if (convertedExampleEndpointCall != null) {
            convertedExamples.push(convertedExampleEndpointCall);
        }
    }
    return convertedExamples;
}

function convertExampleEndpointCall(
    example: IrVersions.V33.ExampleEndpointCall
): IrVersions.V32.ExampleEndpointCall | undefined {
    return {
        ...example,
        queryParameters: example.queryParameters.filter(
            // Filter out all the object query parameters.
            (queryParameter) => !isExampleTypeReferenceObject(queryParameter.value)
        )
    };
}

function isExampleTypeReferenceObject(exampleTypeReference: IrVersions.V33.ExampleTypeReference): boolean {
    switch (exampleTypeReference.shape.type) {
        case "container":
            return isExampleContainerObject(exampleTypeReference.shape.container);
        case "named":
            return isExampleNamedTypeObject(exampleTypeReference.shape);
        case "primitive":
            return false;
        case "unknown":
            return true;
        default:
            assertNever(exampleTypeReference.shape);
    }
}

function isExampleContainerObject(exampleContainer: IrVersions.V33.ExampleContainer): boolean {
    switch (exampleContainer.type) {
        case "map":
        case "list":
        case "set":
            return true;
        case "optional":
            return exampleContainer.optional != null && isExampleTypeReferenceObject(exampleContainer.optional);
        default:
            assertNever(exampleContainer);
    }
}

function isExampleNamedTypeObject(exampleNamedType: IrVersions.V33.ExampleNamedType): boolean {
    switch (exampleNamedType.shape.type) {
        case "alias":
            return isExampleTypeReferenceObject(exampleNamedType.shape.value);
        case "enum":
            return false;
        case "object":
        case "union":
        case "undiscriminatedUnion":
            return true;
        default:
            assertNever(exampleNamedType.shape);
    }
}
