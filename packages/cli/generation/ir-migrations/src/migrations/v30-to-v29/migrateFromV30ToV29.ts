import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V30_TO_V29_MIGRATION: IrMigration<
    IrVersions.V30.ir.IntermediateRepresentation,
    IrVersions.V29.ir.IntermediateRepresentation
> = {
    laterVersion: "v30",
    earlierVersion: "v29",
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
        [GeneratorName.PYTHON_FASTAPI]: "0.6.5-1-g0ef31b7a",
        [GeneratorName.PYTHON_PYDANTIC]: "0.6.5-1-g0ef31b7a",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: "0.6.5-1-g0ef31b7a",
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
        IrSerialization.V29.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v30): IrVersions.V29.ir.IntermediateRepresentation => {
        const converter = new Converter(v30);
        return {
            ...v30,
            types: converter.convertTypes(v30.types),
            services: converter.convertServices(v30.services)
        };
    }
};

class Converter {
    private ir: IrVersions.V30.ir.IntermediateRepresentation;

    constructor(ir: IrVersions.V30.ir.IntermediateRepresentation) {
        this.ir = ir;
    }

    public convertTypes(
        types: Record<IrVersions.V30.TypeId, IrVersions.V30.TypeDeclaration>
    ): Record<IrVersions.V29.TypeId, IrVersions.V29.TypeDeclaration> {
        return Object.fromEntries(
            Object.entries(types).map(([key, val]) => {
                return [key, this.convertType(val)];
            })
        );
    }

    public convertServices(
        services: Record<IrVersions.V30.ServiceId, IrVersions.V30.HttpService>
    ): Record<IrVersions.V29.ServiceId, IrVersions.V29.HttpService> {
        return Object.fromEntries(
            Object.entries(services).map(([key, val]) => {
                return [key, this.convertService(val)];
            })
        );
    }

    private convertService(service: IrVersions.V30.HttpService): IrVersions.V29.HttpService {
        return {
            ...service,
            endpoints: this.convertEndpoints(service.endpoints)
        };
    }

    private convertEndpoints(examples: IrVersions.V30.HttpEndpoint[]): IrVersions.V29.HttpEndpoint[] {
        return examples.map((exampleEndpoint) => {
            return {
                ...exampleEndpoint,
                examples: this.convertExampleEndpointCalls(exampleEndpoint.examples)
            };
        });
    }

    private convertExampleEndpointCalls(
        examples: IrVersions.V30.ExampleEndpointCall[]
    ): IrVersions.V29.ExampleEndpointCall[] {
        return examples.map((exampleEndpointCall) => {
            return {
                ...exampleEndpointCall,
                rootPathParameters: this.convertExamplePathParameters(exampleEndpointCall.rootPathParameters),
                servicePathParameters: this.convertExamplePathParameters(exampleEndpointCall.servicePathParameters),
                endpointPathParameters: this.convertExamplePathParameters(exampleEndpointCall.endpointPathParameters),
                serviceHeaders: this.convertExampleHeaders(exampleEndpointCall.serviceHeaders),
                endpointHeaders: this.convertExampleHeaders(exampleEndpointCall.endpointHeaders),
                queryParameters: this.convertExampleQueryParameters(exampleEndpointCall.queryParameters),
                request:
                    exampleEndpointCall.request != null
                        ? this.convertExampleRequestBody(exampleEndpointCall.request)
                        : undefined,
                response: this.convertExampleResponse(exampleEndpointCall.response)
            };
        });
    }

    private convertExamplePathParameters(
        examples: IrVersions.V30.ExamplePathParameter[]
    ): IrVersions.V29.ExamplePathParameter[] {
        return examples.map((examplePathParameter) => {
            return {
                key: examplePathParameter.name.originalName,
                value: this.convertExampleTypeReference(examplePathParameter.value)
            };
        });
    }

    private convertExampleHeaders(examples: IrVersions.V30.ExampleHeader[]): IrVersions.V29.ExampleHeader[] {
        return examples.map((exampleHeader) => {
            return {
                wireKey: exampleHeader.name.wireValue,
                value: this.convertExampleTypeReference(exampleHeader.value)
            };
        });
    }

    private convertExampleQueryParameters(
        examples: IrVersions.V30.ExampleQueryParameter[]
    ): IrVersions.V29.ExampleQueryParameter[] {
        return examples.map((exampleQueryParameter) => {
            return {
                wireKey: exampleQueryParameter.name.wireValue,
                value: this.convertExampleTypeReference(exampleQueryParameter.value)
            };
        });
    }

    private convertExampleRequestBody(example: IrVersions.V30.ExampleRequestBody): IrVersions.V29.ExampleRequestBody {
        switch (example.type) {
            case "inlinedRequestBody":
                return IrVersions.V29.ExampleRequestBody.inlinedRequestBody({
                    ...example,
                    properties: example.properties.map((exampleObjectProperty) => {
                        return {
                            ...exampleObjectProperty,
                            wireKey: exampleObjectProperty.name.wireValue,
                            value: this.convertExampleTypeReference(exampleObjectProperty.value)
                        };
                    })
                });
            case "reference":
                return IrVersions.V29.ExampleRequestBody.reference(this.convertExampleTypeReference(example));
            default:
                assertNever(example);
        }
    }

    private convertExampleResponse(example: IrVersions.V30.ExampleResponse): IrVersions.V29.ExampleResponse {
        switch (example.type) {
            case "ok":
                return IrVersions.V29.ExampleResponse.ok({
                    body: example.body != null ? this.convertExampleTypeReference(example.body) : undefined
                });
            case "error":
                return IrVersions.V29.ExampleResponse.error({
                    ...example,
                    body: example.body != null ? this.convertExampleTypeReference(example.body) : undefined
                });
            default:
                assertNever(example);
        }
    }

    private convertType(typeDecl: IrVersions.V30.TypeDeclaration): IrVersions.V29.TypeDeclaration {
        return {
            ...typeDecl,
            examples: this.convertExampleTypes(typeDecl.examples)
        };
    }

    private convertExampleTypes(examples: IrVersions.V30.ExampleType[]): IrVersions.V29.ExampleType[] {
        return examples.map((example) => {
            return this.convertExampleType(example);
        });
    }

    private convertExampleType(example: IrVersions.V30.ExampleType): IrVersions.V29.ExampleType {
        return {
            ...example,
            shape: this.convertExampleTypeShape(example.shape)
        };
    }

    private convertExampleTypeReferences(
        examples: IrVersions.V30.ExampleTypeReference[]
    ): IrVersions.V29.ExampleTypeReference[] {
        return examples.map((example) => {
            return this.convertExampleTypeReference(example);
        });
    }

    private convertExampleTypeReference(
        example: IrVersions.V30.ExampleTypeReference
    ): IrVersions.V29.ExampleTypeReference {
        return {
            ...example,
            shape: this.convertExampleTypeReferenceShape(example.shape)
        };
    }

    private convertExampleTypeReferenceShape(
        example: IrVersions.V30.ExampleTypeReferenceShape
    ): IrVersions.V29.ExampleTypeReferenceShape {
        switch (example.type) {
            case "primitive":
                return IrVersions.V29.ExampleTypeReferenceShape.primitive(
                    this.convertExamplePrimitive(example.primitive)
                );
            case "container":
                return IrVersions.V29.ExampleTypeReferenceShape.container(
                    this.convertExampleContainer(example.container)
                );
            case "named":
                return IrVersions.V29.ExampleTypeReferenceShape.named(this.convertExampleNamedType(example));
            case "unknown":
                return IrVersions.V29.ExampleTypeReferenceShape.unknown(example);
            default:
                assertNever(example);
        }
    }

    private convertExamplePrimitive(example: IrVersions.V30.ExamplePrimitive): IrVersions.V29.ExamplePrimitive {
        switch (example.type) {
            case "integer":
                return IrVersions.V29.ExamplePrimitive.integer(example.integer);
            case "double":
                return IrVersions.V29.ExamplePrimitive.double(example.double);
            case "string":
                return IrVersions.V29.ExamplePrimitive.string(example.string.original);
            case "boolean":
                return IrVersions.V29.ExamplePrimitive.boolean(example.boolean);
            case "long":
                return IrVersions.V29.ExamplePrimitive.long(example.long);
            case "datetime":
                return IrVersions.V29.ExamplePrimitive.datetime(example.datetime);
            case "date":
                return IrVersions.V29.ExamplePrimitive.date(example.date);
            case "uuid":
                return IrVersions.V29.ExamplePrimitive.uuid(example.uuid);
            default:
                assertNever(example);
        }
    }

    private convertExampleContainer(example: IrVersions.V30.ExampleContainer): IrVersions.V29.ExampleContainer {
        switch (example.type) {
            case "list":
                return IrVersions.V29.ExampleContainer.list(this.convertExampleTypeReferences(example.list));
            case "set":
                return IrVersions.V29.ExampleContainer.set(this.convertExampleTypeReferences(example.set));
            case "optional":
                return IrVersions.V29.ExampleContainer.optional(
                    example.optional != null ? this.convertExampleTypeReference(example.optional) : undefined
                );
            case "map":
                return IrVersions.V29.ExampleContainer.map(this.convertKeyValuePairs(example.map));
            default:
                assertNever(example);
        }
    }

    private convertKeyValuePairs(examples: IrVersions.V30.ExampleKeyValuePair[]): IrVersions.V29.ExampleKeyValuePair[] {
        return examples.map((example) => {
            return {
                key: this.convertExampleTypeReference(example.key),
                value: this.convertExampleTypeReference(example.value)
            };
        });
    }

    private convertExampleNamedType(example: IrVersions.V30.ExampleNamedType): IrVersions.V29.ExampleNamedType {
        return {
            ...example,
            shape: this.convertExampleTypeShape(example.shape)
        };
    }

    private convertExampleTypeShape(example: IrVersions.V30.ExampleTypeShape): IrVersions.V29.ExampleTypeShape {
        switch (example.type) {
            case "alias":
                return IrVersions.V29.ExampleTypeShape.alias({
                    value: this.convertExampleTypeReference(example.value)
                });
            case "enum":
                return IrVersions.V29.ExampleTypeShape.enum({ wireValue: example.value.wireValue });
            case "object":
                return IrVersions.V29.ExampleTypeShape.object(this.convertExampleObjectType(example));
            case "union":
                return IrVersions.V29.ExampleTypeShape.union(this.convertExampleUnionType(example));
            default:
                assertNever(example);
        }
    }

    private convertExampleObjectType(example: IrVersions.V30.ExampleObjectType): IrVersions.V29.ExampleObjectType {
        return {
            properties: example.properties.map((exampleObjectProperty) => {
                return {
                    ...exampleObjectProperty,
                    wireKey: exampleObjectProperty.name.wireValue,
                    value: this.convertExampleTypeReference(exampleObjectProperty.value)
                };
            })
        };
    }

    private convertExampleUnionType(example: IrVersions.V30.ExampleUnionType): IrVersions.V29.ExampleSingleUnionType {
        return {
            wireDiscriminantValue: example.singleUnionType.wireDiscriminantValue.wireValue,
            properties: this.convertExampleSingleUnionTypeProperties(example.singleUnionType.shape)
        };
    }

    private convertExampleSingleUnionTypeProperties(
        example: IrVersions.V30.ExampleSingleUnionTypeProperties
    ): IrVersions.V29.ExampleSingleUnionTypeProperties {
        switch (example.type) {
            case "samePropertiesAsObject": {
                const typeName = this.ir.types[example.typeId]?.name;
                if (typeName == null) {
                    throw new Error(`Internal error; type ID ${example.typeId} does not exist in the IR`);
                }
                return IrVersions.V29.ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                    typeName,
                    shape: this.convertExampleTypeShape(
                        IrVersions.V30.ExampleTypeShape.object({ properties: example.object.properties })
                    )
                });
            }
            case "singleProperty":
                return IrVersions.V29.ExampleSingleUnionTypeProperties.singleProperty({
                    ...example,
                    shape: this.convertExampleTypeReferenceShape(example.shape)
                });
            case "noProperties":
                return IrVersions.V29.ExampleSingleUnionTypeProperties.noProperties();
            default:
                assertNever(example);
        }
    }
}
