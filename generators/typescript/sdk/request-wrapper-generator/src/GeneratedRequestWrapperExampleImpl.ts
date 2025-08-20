import {
    ExampleEndpointCall,
    ExampleTypeReferenceShape,
    HttpRequestBody,
    Name,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getPropertyKey, PackageId } from "@fern-typescript/commons";
import { GeneratedRequestWrapperExample, SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

const DEFAULT_FILE_PATH = "/path/to/your/file";
const UNKNOWN_REQUEST_TYPE_ERROR = "Encountered unknown example request type";
const INVALID_PROPERTY_TYPE_ERROR = (type: string) => `Property does not come from an object, instead got ${type}`;

export declare namespace GeneratedRequestWrapperExampleImpl {
    export interface Init {
        bodyPropertyName: string;
        example: ExampleEndpointCall;
        packageId: PackageId;
        endpointName: Name;
        requestBody: HttpRequestBody | undefined;
        dangerouslyFlattenRequestParameters: boolean;
    }
}

export class GeneratedRequestWrapperExampleImpl implements GeneratedRequestWrapperExample {
    private bodyPropertyName: string;
    private example: ExampleEndpointCall;
    private packageId: PackageId;
    private endpointName: Name;
    private requestBody: HttpRequestBody | undefined;
    private dangerouslyFlattenRequestParameters: boolean;

    constructor({
        bodyPropertyName,
        example,
        packageId,
        endpointName,
        requestBody,
        dangerouslyFlattenRequestParameters
    }: GeneratedRequestWrapperExampleImpl.Init) {
        this.bodyPropertyName = bodyPropertyName;
        this.example = example;
        this.packageId = packageId;
        this.endpointName = endpointName;
        this.requestBody = requestBody;
        this.dangerouslyFlattenRequestParameters = dangerouslyFlattenRequestParameters;
    }

    public build(context: SdkContext, opts: GetReferenceOpts): ts.Expression {
        return this.buildExample({ context, opts });
    }

    private buildExample({ context, opts }: { context: SdkContext; opts: GetReferenceOpts }): ts.Expression {
        const generatedType = context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpointName);
        
        const fileProperties = this.buildFileProperties(context, generatedType);
        const headerProperties = this.buildHeaderProperties(context, generatedType, opts);
        const pathParamProperties = this.buildPathParamProperties(context, generatedType, opts);
        const queryParamProperties = this.buildQueryParamProperties(context, generatedType, opts);
        const bodyProperties = this.buildBodyProperties(context, generatedType, opts);

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

    private buildFileProperties(context: SdkContext, generatedType: any): ts.PropertyAssignment[] {
        const fileProperties = [];
        if (context.inlineFileProperties && this.requestBody != null && this.requestBody.type === "fileUpload") {
            for (const property of this.requestBody.properties) {
                if (property.type === "file") {
                    if (property.value.isOptional) {
                        continue;
                    }
                    const createReadStream = context.externalDependencies.fs.createReadStream(
                        ts.factory.createStringLiteral(DEFAULT_FILE_PATH)
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
        return fileProperties;
    }

    private buildHeaderProperties(context: SdkContext, generatedType: any, opts: GetReferenceOpts): ts.PropertyAssignment[] {
        return [...this.example.serviceHeaders, ...this.example.endpointHeaders]
            .filter((header) => this.isNotLiteral(header.value.shape))
            .map((header) => {
                return ts.factory.createPropertyAssignment(
                    getPropertyKey(generatedType.getPropertyNameOfNonLiteralHeaderFromName(header.name).propertyName),
                    context.type.getGeneratedExample(header.value).build(context, opts)
                );
            });
    }

    private buildPathParamProperties(context: SdkContext, generatedType: any, opts: GetReferenceOpts): ts.PropertyAssignment[] {
        return generatedType.shouldInlinePathParameters()
            ? [...this.example.servicePathParameters, ...this.example.endpointPathParameters].map((pathParam) => {
                  return ts.factory.createPropertyAssignment(
                      getPropertyKey(generatedType.getPropertyNameOfPathParameterFromName(pathParam.name).propertyName),
                      context.type.getGeneratedExample(pathParam.value).build(context, opts)
                  );
              })
            : [];
    }

    private buildQueryParamProperties(context: SdkContext, generatedType: any, opts: GetReferenceOpts): ts.PropertyAssignment[] {
        return [...this.example.queryParameters].map((queryParam) => {
            return ts.factory.createPropertyAssignment(
                getPropertyKey(generatedType.getPropertyNameOfQueryParameterFromName(queryParam.name).propertyName),
                context.type.getGeneratedExample(queryParam.value).build(context, opts)
            );
        });
    }

    private buildBodyProperties(context: SdkContext, generatedType: any, opts: GetReferenceOpts): ts.PropertyAssignment[] {
        return this.example.request?._visit<ts.PropertyAssignment[]>({
            inlinedRequestBody: (body) => {
                const properties = this.buildInlinedRequestBodyProperties(body, generatedType, context, opts);
                
                if (this.dangerouslyFlattenRequestParameters) {
                    return properties;
                } else {
                    return [
                        ts.factory.createPropertyAssignment(
                            getPropertyKey(this.bodyPropertyName),
                            ts.factory.createObjectLiteralExpression(properties, true)
                        )
                    ];
                }
            },
            reference: (type) => {
                const generatedExample = context.type.getGeneratedExample(type).build(context, opts);
                
                if (this.dangerouslyFlattenRequestParameters && ts.isObjectLiteralExpression(generatedExample)) {
                    return generatedExample.properties.filter((prop): prop is ts.PropertyAssignment => 
                        ts.isPropertyAssignment(prop)
                    );
                }
                
                return [
                    ts.factory.createPropertyAssignment(
                        getPropertyKey(this.bodyPropertyName),
                        generatedExample
                    )
                ];
            },
            _other: () => {
                throw new Error(UNKNOWN_REQUEST_TYPE_ERROR);
            }
        }) ?? [];
    }

    private buildInlinedRequestBodyProperties(
        body: any,
        generatedType: any,
        context: SdkContext,
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        if (!body?.properties) {
            return [];
        }

        const filteredProperties = body.properties
            .filter((property: any) => property && this.isNotLiteral(property.value?.shape));
        
        return filteredProperties
            .map((property: any) => this.buildPropertyAssignment(property, generatedType, context, opts))
            .filter(Boolean);
    }

    private buildPropertyAssignment(
        property: any,
        generatedType: any,
        context: SdkContext,
        opts: GetReferenceOpts
    ): ts.PropertyAssignment | null {
        try {
            if (property.originalTypeDeclaration != null) {
                return this.buildOriginalTypePropertyAssignment(property, context, opts);
            } else {
                return this.buildDefaultPropertyAssignment(property, generatedType, context, opts);
            }
        } catch (error) {
            console.warn(`Failed to build property assignment for ${property?.name?.wireValue}:`, error);
            return null;
        }
    }

    private buildOriginalTypePropertyAssignment(
        property: any,
        context: SdkContext,
        opts: GetReferenceOpts
    ): ts.PropertyAssignment {
        const originalTypeForProperty = context.type.getGeneratedType(property.originalTypeDeclaration);
        
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
            throw new Error(INVALID_PROPERTY_TYPE_ERROR(originalTypeForProperty.type));
        }
        
        const key = originalTypeForProperty.getPropertyKey({
            propertyWireKey: property.name.wireValue
        });
        return ts.factory.createPropertyAssignment(
            getPropertyKey(key),
            context.type.getGeneratedExample(property.value).build(context, opts)
        );
    }

    private buildDefaultPropertyAssignment(
        property: any,
        generatedType: any,
        context: SdkContext,
        opts: GetReferenceOpts
    ): ts.PropertyAssignment {
        const propertyKey = generatedType.getInlinedRequestBodyPropertyKeyFromName(property.name);
        return ts.factory.createPropertyAssignment(
            getPropertyKey(propertyKey.propertyName),
            context.type.getGeneratedExample(property.value).build(context, opts)
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
