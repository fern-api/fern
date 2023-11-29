import { ExampleEndpointCall, Name } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, PackageId } from "@fern-typescript/commons";
import { GeneratedRequestWrapperExample, SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export declare namespace GeneratedRequestWrapperExampleImpl {
    export interface Init {
        bodyPropertyName: string;
        example: ExampleEndpointCall;
        packageId: PackageId;
        endpointName: Name;
    }
}

export class GeneratedRequestWrapperExampleImpl implements GeneratedRequestWrapperExample {
    private bodyPropertyName: string;
    private example: ExampleEndpointCall;
    private packageId: PackageId;
    private endpointName: Name;

    constructor({ bodyPropertyName, example, packageId, endpointName }: GeneratedRequestWrapperExampleImpl.Init) {
        this.bodyPropertyName = bodyPropertyName;
        this.example = example;
        this.packageId = packageId;
        this.endpointName = endpointName;
    }

    public build(context: SdkContext, opts: GetReferenceOpts): ts.Expression {
        return this.buildExample({ context, opts });
    }

    private buildExample({ context, opts }: { context: SdkContext; opts: GetReferenceOpts }): ts.Expression {
        const generatedType = context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpointName);
        const headerProperties = [...this.example.serviceHeaders, ...this.example.endpointHeaders].map((header) => {
            return ts.factory.createPropertyAssignment(
                generatedType.getPropertyNameOfNonLiteralHeaderFromName(header.name).propertyName,
                context.type.getGeneratedExample(header.value).build(context, opts)
            );
        });
        const queryParamProperties = [...this.example.queryParameters].map((queryParam) => {
            return ts.factory.createPropertyAssignment(
                generatedType.getPropertyNameOfQueryParameterFromName(queryParam.name).propertyName,
                context.type.getGeneratedExample(queryParam.value).build(context, opts)
            );
        });
        const bodyProperties =
            this.example.request?._visit<ts.PropertyAssignment[]>({
                inlinedRequestBody: (body) => {
                    return body.properties.map((property) => {
                        if (property.originalTypeDeclaration != null) {
                            const originalTypeForProperty = context.type.getGeneratedType(
                                property.originalTypeDeclaration
                            );
                            if (originalTypeForProperty.type !== "object") {
                                throw new Error("Property does not come from an object");
                            }
                            const key = originalTypeForProperty.getPropertyKey({
                                propertyWireKey: property.name.wireValue,
                            });
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
                    });
                },
                reference: (type) => {
                    return [
                        ts.factory.createPropertyAssignment(
                            this.bodyPropertyName,
                            context.type.getGeneratedExample(type).build(context, opts)
                        ),
                    ];
                },
                _other: () => {
                    throw new Error("Encountered unknown example request type");
                },
            }) ?? [];

        return ts.factory.createObjectLiteralExpression(
            [...headerProperties, ...queryParamProperties, ...bodyProperties],
            true
        );
    }
}
