import { ExampleHeader, ExampleInlinedRequestBody, ExampleQueryParameter, Name } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, PackageId } from "@fern-typescript/commons";
import { GeneratedRequestWrapperExample, SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export declare namespace GeneratedRequestWrapperExampleImpl {
    export interface Init {
        exampleHeaders: ExampleHeader[];
        exampleBody: ExampleInlinedRequestBody | undefined;
        exampleQueryParameters: ExampleQueryParameter[];
        packageId: PackageId;
        endpointName: Name;
    }
}

export class GeneratedRequestWrapperExampleImpl implements GeneratedRequestWrapperExample {
    private exampleHeaders: ExampleHeader[];
    private exampleBody: ExampleInlinedRequestBody | undefined;
    private exampleQueryParameters: ExampleQueryParameter[];
    private packageId: PackageId;
    private endpointName: Name;

    constructor({
        exampleBody,
        exampleHeaders,
        exampleQueryParameters,
        packageId,
        endpointName,
    }: GeneratedRequestWrapperExampleImpl.Init) {
        this.exampleHeaders = exampleHeaders;
        this.exampleBody = exampleBody;
        this.exampleQueryParameters = exampleQueryParameters;
        this.packageId = packageId;
        this.endpointName = endpointName;
    }

    public build(context: SdkContext, opts: GetReferenceOpts): ts.Expression {
        return this.buildExample({ context, opts });
    }

    private buildExample({ context, opts }: { context: SdkContext; opts: GetReferenceOpts }): ts.Expression {
        const generatedType = context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpointName);
        const headerProperties = this.exampleHeaders.map((header) => {
            return ts.factory.createPropertyAssignment(
                generatedType.getPropertyNameOfNonLiteralHeaderFromName(header.name).propertyName,
                context.type.getGeneratedExample(header.value).build(context, opts)
            );
        });
        const queryParamProperties = this.exampleQueryParameters.map((queryParam) => {
            return ts.factory.createPropertyAssignment(
                generatedType.getPropertyNameOfQueryParameterFromName(queryParam.name).propertyName,
                context.type.getGeneratedExample(queryParam.value).build(context, opts)
            );
        });
        const bodyProperties =
            this.exampleBody?.properties.map((property) => {
                if (property.originalTypeDeclaration != null) {
                    const originalTypeForProperty = context.type.getGeneratedType(property.originalTypeDeclaration);
                    if (originalTypeForProperty.type !== "object") {
                        throw new Error("Property does not come from an object");
                    }
                    const key = originalTypeForProperty.getPropertyKey({ propertyWireKey: property.name.wireValue });
                    return ts.factory.createPropertyAssignment(
                        key,
                        context.type.getGeneratedExample(property.value).build(context, opts)
                    );
                } else {
                    return ts.factory.createPropertyAssignment(
                        generatedType.getInlinedRequestBodyPropertyKeyFromName(property.name),
                        context.type.getGeneratedExample(property.value).build(context, opts)
                    );
                }
            }) ?? [];

        return ts.factory.createObjectLiteralExpression(
            [...headerProperties, ...queryParamProperties, ...bodyProperties],
            true
        );
    }
}
