import { GetReferenceOpts, PackageId, getPropertyKey } from "@fern-typescript/commons";
import { GeneratedRequestWrapperExample, SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import {
    ExampleEndpointCall,
    ExampleTypeReferenceShape,
    HttpRequestBody,
    Name,
    TypeReference
} from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedRequestWrapperExampleImpl {
    export interface Init {
        bodyPropertyName: string;
        example: ExampleEndpointCall;
        packageId: PackageId;
        endpointName: Name;
        requestBody: HttpRequestBody | undefined;
    }
}

export class GeneratedRequestWrapperExampleImpl implements GeneratedRequestWrapperExample {
    private bodyPropertyName: string;
    private example: ExampleEndpointCall;
    private packageId: PackageId;
    private endpointName: Name;
    private requestBody: HttpRequestBody | undefined;

    constructor({
        bodyPropertyName,
        example,
        packageId,
        endpointName,
        requestBody
    }: GeneratedRequestWrapperExampleImpl.Init) {
        this.bodyPropertyName = bodyPropertyName;
        this.example = example;
        this.packageId = packageId;
        this.endpointName = endpointName;
        this.requestBody = requestBody;
    }

    public build(context: SdkContext, opts: GetReferenceOpts): ts.Expression {
        return this.buildExample({ context, opts });
    }

    private buildExample({ context, opts }: { context: SdkContext; opts: GetReferenceOpts }): ts.Expression {
        const generatedType = context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpointName);
        const fileProperties = [];
        if (context.inlineFileProperties && this.requestBody != null && this.requestBody.type === "fileUpload") {
            for (const property of this.requestBody.properties) {
                if (property.type === "file") {
                    if (property.value.isOptional) {
                        continue;
                    }
                    const createReadStream = context.externalDependencies.fs.createReadStream(
                        ts.factory.createStringLiteral("/path/to/your/file")
                    );
                    if (property.value.type === "fileArray") {
                        fileProperties.push(
                            ts.factory.createPropertyAssignment(
                                getPropertyKey(
                                    generatedType.getPropertyNameOfFileParameter(property.value).propertyName
                                ),
                                ts.factory.createArrayLiteralExpression([createReadStream])
                            )
                        );
                    } else {
                        fileProperties.push(
                            ts.factory.createPropertyAssignment(
                                getPropertyKey(
                                    generatedType.getPropertyNameOfFileParameter(property.value).propertyName
                                ),
                                createReadStream
                            )
                        );
                    }
                }
            }
        }
        const headerProperties = [...this.example.serviceHeaders, ...this.example.endpointHeaders]
            .filter((header) => this.isNotLiteral(header.value.shape))
            .map((header) => {
                return ts.factory.createPropertyAssignment(
                    getPropertyKey(generatedType.getPropertyNameOfNonLiteralHeaderFromName(header.name).propertyName),
                    context.type.getGeneratedExample(header.value).build(context, opts)
                );
            });

        const pathParamProperties = generatedType.shouldInlinePathParameters()
            ? [...this.example.servicePathParameters, ...this.example.endpointPathParameters].map((pathParam) => {
                  return ts.factory.createPropertyAssignment(
                      getPropertyKey(generatedType.getPropertyNameOfPathParameterFromName(pathParam.name).propertyName),
                      context.type.getGeneratedExample(pathParam.value).build(context, opts)
                  );
              })
            : [];

        const queryParamProperties = [...this.example.queryParameters].map((queryParam) => {
            return ts.factory.createPropertyAssignment(
                getPropertyKey(generatedType.getPropertyNameOfQueryParameterFromName(queryParam.name).propertyName),
                context.type.getGeneratedExample(queryParam.value).build(context, opts)
            );
        });
        const bodyProperties =
            this.example.request?._visit<ts.PropertyAssignment[]>({
                inlinedRequestBody: (body) => {
                    return body.properties
                        .filter((property) => this.isNotLiteral(property.value.shape))
                        .map((property) => {
                            if (property.originalTypeDeclaration != null) {
                                const originalTypeForProperty = context.type.getGeneratedType(
                                    property.originalTypeDeclaration
                                );
                                if (originalTypeForProperty.type === "union") {
                                    const propertyKey = originalTypeForProperty.getSinglePropertyKey({
                                        name: property.name,
                                        type: TypeReference.named({
                                            ...property.originalTypeDeclaration,
                                            default: undefined,
                                            inline: undefined
                                        })
                                    });
                                    return ts.factory.createPropertyAssignment(
                                        getPropertyKey(propertyKey),
                                        context.type.getGeneratedExample(property.value).build(context, opts)
                                    );
                                }
                                if (originalTypeForProperty.type !== "object") {
                                    throw new Error(
                                        `Property does not come from an object, instead got ${originalTypeForProperty.type}`
                                    );
                                }
                                const key = originalTypeForProperty.getPropertyKey({
                                    propertyWireKey: property.name.wireValue
                                });
                                return ts.factory.createPropertyAssignment(
                                    getPropertyKey(key),
                                    context.type.getGeneratedExample(property.value).build(context, opts)
                                );
                            } else {
                                return ts.factory.createPropertyAssignment(
                                    getPropertyKey(
                                        generatedType.getInlinedRequestBodyPropertyKeyFromName(property.name)
                                    ),
                                    context.type.getGeneratedExample(property.value).build(context, opts)
                                );
                            }
                        });
                },
                reference: (type) => {
                    return [
                        ts.factory.createPropertyAssignment(
                            getPropertyKey(this.bodyPropertyName),
                            context.type.getGeneratedExample(type).build(context, opts)
                        )
                    ];
                },
                _other: () => {
                    throw new Error("Encountered unknown example request type");
                }
            }) ?? [];

        return ts.factory.createObjectLiteralExpression(
            [
                ...fileProperties,
                ...headerProperties,
                ...pathParamProperties,
                ...queryParamProperties,
                ...bodyProperties
            ],
            true
        );
    }

    private isNotLiteral(shape: ExampleTypeReferenceShape): boolean {
        if (shape.type === "named" && shape.shape.type === "alias") {
            return this.isNotLiteral(shape.shape.value.shape);
        } else {
            return !(shape.type === "container" && shape.container.type === "literal");
        }
    }
}
