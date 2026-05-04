import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts, getPropertyKey, isExpressionUndefined, PackageId } from "@fern-typescript/commons";
import { FileContext, GeneratedRequestWrapper, GeneratedRequestWrapperExample } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export declare namespace GeneratedRequestWrapperExampleImpl {
    export interface Init {
        bodyPropertyName: string;
        example: FernIr.ExampleEndpointCall;
        packageId: PackageId;
        endpointName: FernIr.NameOrString;
        requestBody: FernIr.HttpRequestBody | undefined;
        flattenRequestParameters: boolean;
    }
}

export class GeneratedRequestWrapperExampleImpl implements GeneratedRequestWrapperExample {
    private static readonly DEFAULT_FILE_PATH = "/path/to/your/file";

    private bodyPropertyName: string;
    private example: FernIr.ExampleEndpointCall;
    private packageId: PackageId;
    private endpointName: FernIr.NameOrString;
    private requestBody: FernIr.HttpRequestBody | undefined;
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

    public build(context: FileContext, opts: GetReferenceOpts): ts.Expression {
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

    private buildFileProperties(context: FileContext, generatedType: GeneratedRequestWrapper): ts.PropertyAssignment[] {
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
            const value =
                property.value.type === "fileArray"
                    ? ts.factory.createArrayLiteralExpression([createReadStream])
                    : createReadStream;

            properties.push(ts.factory.createPropertyAssignment(getPropertyKey(propertyName), value));
        }

        return properties;
    }

    private buildHeaderProperties(
        context: FileContext,
        generatedType: GeneratedRequestWrapper,
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        const headers = [...this.example.serviceHeaders, ...this.example.endpointHeaders];

        return headers
            .filter((header) => this.isNotLiteral(header.value.shape))
            .map((header) => {
                const propertyName = generatedType.getPropertyNameOfNonLiteralHeaderFromName(header.name).propertyName;
                const value = context.type.getGeneratedExample(header.value).build(context, opts);

                return ts.factory.createPropertyAssignment(getPropertyKey(propertyName), value);
            });
    }

    private buildPathParamProperties(
        context: FileContext,
        generatedType: GeneratedRequestWrapper,
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        if (!generatedType.shouldInlinePathParameters(context)) {
            return [];
        }

        const pathParams = [...this.example.servicePathParameters, ...this.example.endpointPathParameters];

        return pathParams.map((pathParam) => {
            const propertyName = generatedType.getPropertyNameOfPathParameterFromName(pathParam.name).propertyName;
            const value = context.type.getGeneratedExample(pathParam.value).build(context, opts);

            return ts.factory.createPropertyAssignment(getPropertyKey(propertyName), value);
        });
    }

    private buildQueryParamProperties(
        context: FileContext,
        generatedType: GeneratedRequestWrapper,
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        return this.example.queryParameters.map((queryParam) => {
            const propertyName = generatedType.getPropertyNameOfQueryParameterFromName(queryParam.name).propertyName;
            const value = context.type.getGeneratedExample(queryParam.value).build(context, opts);

            return ts.factory.createPropertyAssignment(getPropertyKey(propertyName), value);
        });
    }

    private buildBodyProperties(
        context: FileContext,
        generatedType: GeneratedRequestWrapper,
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        if (!this.example.request) {
            return [];
        }

        return this.example.request._visit<ts.PropertyAssignment[]>({
            inlinedRequestBody: (body) => this.buildInlinedRequestBodyProperties(body, context, generatedType, opts),
            reference: (type) => this.buildReferencedBodyProperties(type, context, opts),
            _other: () => {
                throw new Error("Encountered unknown example request type");
            }
        });
    }

    private buildInlinedRequestBodyProperties(
        body: FernIr.ExampleInlinedRequestBody,
        context: FileContext,
        generatedType: GeneratedRequestWrapper,
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        return [
            ...body.properties
                .filter((property) => this.isNotLiteral(property.value.shape))
                .map((property) => {
                    if (property.originalTypeDeclaration != null) {
                        const originalTypeForProperty = context.type.getGeneratedType(property.originalTypeDeclaration);
                        if (originalTypeForProperty.type === "union") {
                            const propertyKey = originalTypeForProperty.getSinglePropertyKey({
                                name: property.name,
                                type: FernIr.TypeReference.named({
                                    ...property.originalTypeDeclaration,
                                    default: undefined,
                                    inline: undefined
                                })
                            });
                            const value = context.type.getGeneratedExample(property.value).build(context, opts);
                            if (isExpressionUndefined(value)) {
                                return undefined;
                            }
                            return ts.factory.createPropertyAssignment(getPropertyKey(propertyKey), value);
                        }
                        if (originalTypeForProperty.type !== "object") {
                            throw new Error(
                                `Property does not come from an object, instead got ${originalTypeForProperty.type}`
                            );
                        }
                        try {
                            const key = originalTypeForProperty.getPropertyKey({
                                propertyWireKey: getWireValue(property.name)
                            });
                            const value = context.type.getGeneratedExample(property.value).build(context, opts);
                            if (isExpressionUndefined(value)) {
                                return undefined;
                            }
                            return ts.factory.createPropertyAssignment(getPropertyKey(key), value);
                        } catch (e) {
                            context.logger.debug(
                                `Failed to get property key for property with wire value '${getWireValue(property.name)}' in request example. ` +
                                    `This may indicate a mismatch between the example and the type definition.`
                            );
                            return undefined;
                        }
                    } else {
                        const value = context.type.getGeneratedExample(property.value).build(context, opts);
                        if (isExpressionUndefined(value)) {
                            return undefined;
                        }
                        return ts.factory.createPropertyAssignment(
                            getPropertyKey(
                                generatedType.getInlinedRequestBodyPropertyKeyFromName(property.name).propertyName
                            ),
                            value
                        );
                    }
                })
                .filter((property) => property != null),
            ...(body.extraProperties ?? [])
                .map((extraProperty) => {
                    const value = context.type.getGeneratedExample(extraProperty.value).build(context, opts);
                    if (isExpressionUndefined(value)) {
                        return undefined;
                    }
                    return ts.factory.createPropertyAssignment(getPropertyKey(getWireValue(extraProperty.name)), value);
                })
                .filter((property) => property != null)
        ];
    }

    private buildReferencedBodyProperties(
        type: FernIr.ExampleTypeReference,
        context: FileContext,
        opts: GetReferenceOpts
    ): ts.PropertyAssignment[] {
        const generatedExample = context.type.getGeneratedExample(type).build(context, opts);

        if (this.flattenRequestParameters && ts.isObjectLiteralExpression(generatedExample)) {
            return generatedExample.properties.filter((prop): prop is ts.PropertyAssignment =>
                ts.isPropertyAssignment(prop)
            );
        }

        return [ts.factory.createPropertyAssignment(getPropertyKey(this.bodyPropertyName), generatedExample)];
    }

    private isNotLiteral(shape: FernIr.ExampleTypeReferenceShape): boolean {
        if (shape.type === "named" && shape.shape.type === "alias") {
            return this.isNotLiteral(shape.shape.value.shape);
        }

        return !(shape.type === "container" && shape.container.type === "literal");
    }
}
