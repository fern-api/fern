import {
    ExampleEndpointCall,
    ExampleInlinedRequestBody,
    ExampleInlinedRequestBodyProperty,
    ExampleTypeReference,
    ExampleTypeReferenceShape,
    HttpRequestBody,
    Name,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getPropertyKey, PackageId } from "@fern-typescript/commons";
import { GeneratedRequestWrapper, GeneratedRequestWrapperExample, SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export declare namespace GeneratedRequestWrapperExampleImpl {
    export interface Init {
        bodyPropertyName: string;
        example: ExampleEndpointCall;
        packageId: PackageId;
        endpointName: Name;
        requestBody: HttpRequestBody | undefined;
        flattenRequestParameters: boolean;
    }
}

export class GeneratedRequestWrapperExampleImpl implements GeneratedRequestWrapperExample {
    private static readonly DEFAULT_FILE_PATH = "/path/to/your/file";
    
    private bodyPropertyName: string;
    private example: ExampleEndpointCall;
    private packageId: PackageId;
    private endpointName: Name;
    private requestBody: HttpRequestBody | undefined;
    private flattenRequestParameters: boolean;

    constructor({
        bodyPropertyName,
        example,
        packageId,
        endpointName,
        requestBody,
        flattenRequestParameters
    }: GeneratedRequestWrapperExampleImpl.Init) {
        this.bodyPropertyName = bodyPropertyName;
        this.example = example;
        this.packageId = packageId;
        this.endpointName = endpointName;
        this.requestBody = requestBody;
        this.flattenRequestParameters = flattenRequestParameters;
    }

    public build(context: SdkContext, opts: GetReferenceOpts): ts.Expression {
        const generatedType = context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpointName);
        
        const properties = [
            ...this.buildFileProperties(context, generatedType),
            ...this.buildHeaderProperties(context, generatedType, opts),
            ...this.buildPathParamProperties(context, generatedType, opts),
            ...this.buildQueryParamProperties(context, generatedType, opts),
            ...this.buildBodyProperties(context, generatedType, opts)
        ];

        return ts.factory.createObjectLiteralExpression(properties, true);
    }

    private buildFileProperties(context: SdkContext, generatedType: GeneratedRequestWrapper): ts.PropertyAssignment[] {
        if (!context.inlineFileProperties || !this.requestBody || this.requestBody.type !== "fileUpload") {
            return [];
        }

        const properties: ts.PropertyAssignment[] = [];

        for (const property of this.requestBody.properties) {
            if (property.type !== "file" || property.value.isOptional) {
                continue;
            }

            const createReadStream = context.externalDependencies.fs.createReadStream(
                ts.factory.createStringLiteral(GeneratedRequestWrapperExampleImpl.DEFAULT_FILE_PATH)
            );

            const propertyName = generatedType.getPropertyNameOfFileParameter(property.value).propertyName;
            const value = property.value.type === "fileArray" 
                ? ts.factory.createArrayLiteralExpression([createReadStream])
                : createReadStream;

            properties.push(
                ts.factory.createPropertyAssignment(getPropertyKey(propertyName), value)
            );
        }

        return properties;
    }

    private buildHeaderProperties(
        context: SdkContext, 
        generatedType: GeneratedRequestWrapper, 
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        const headers = [...this.example.serviceHeaders, ...this.example.endpointHeaders];
        
        return headers
            .filter(header => this.isNotLiteral(header.value.shape))
            .map(header => {
                const propertyName = generatedType.getPropertyNameOfNonLiteralHeaderFromName(header.name).propertyName;
                const value = context.type.getGeneratedExample(header.value).build(context, opts);
                
                return ts.factory.createPropertyAssignment(getPropertyKey(propertyName), value);
            });
    }

    private buildPathParamProperties(
        context: SdkContext, 
        generatedType: GeneratedRequestWrapper, 
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        if (!generatedType.shouldInlinePathParameters()) {
            return [];
        }

        const pathParams = [...this.example.servicePathParameters, ...this.example.endpointPathParameters];
        
        return pathParams.map(pathParam => {
            const propertyName = generatedType.getPropertyNameOfPathParameterFromName(pathParam.name).propertyName;
            const value = context.type.getGeneratedExample(pathParam.value).build(context, opts);
            
            return ts.factory.createPropertyAssignment(getPropertyKey(propertyName), value);
        });
    }

    private buildQueryParamProperties(
        context: SdkContext, 
        generatedType: GeneratedRequestWrapper, 
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        return this.example.queryParameters.map(queryParam => {
            const propertyName = generatedType.getPropertyNameOfQueryParameterFromName(queryParam.name).propertyName;
            const value = context.type.getGeneratedExample(queryParam.value).build(context, opts);
            
            return ts.factory.createPropertyAssignment(getPropertyKey(propertyName), value);
        });
    }

    private buildBodyProperties(
        context: SdkContext, 
        generatedType: GeneratedRequestWrapper, 
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        if (!this.example.request) {
            return [];
        }

        return this.example.request._visit<ts.PropertyAssignment[]>({
            inlinedRequestBody: body => this.buildInlinedRequestBodyProperties(body, context, generatedType, opts),
            reference: type => this.buildReferencedBodyProperties(type, context, opts),
            _other: () => {
                throw new Error("Encountered unknown example request type");
            }
        });
    }

    private buildInlinedRequestBodyProperties(
        body: ExampleInlinedRequestBody,
        context: SdkContext,
        generatedType: GeneratedRequestWrapper,
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        return body.properties
            .filter(property => this.isNotLiteral(property.value.shape))
            .map(property => {
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
                                .propertyName
                        ),
                        context.type.getGeneratedExample(property.value).build(context, opts)
                    );
                }
            });
    }



    private buildReferencedBodyProperties(
        type: ExampleTypeReference,
        context: SdkContext,
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        const generatedExample = context.type.getGeneratedExample(type).build(context, opts);
        
        if (this.flattenRequestParameters && ts.isObjectLiteralExpression(generatedExample)) {
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
    }

    private isNotLiteral(shape: ExampleTypeReferenceShape): boolean {
        if (shape.type === "named" && shape.shape.type === "alias") {
            return this.isNotLiteral(shape.shape.value.shape);
        }
        
        return !(shape.type === "container" && shape.container.type === "literal");
    }
}
