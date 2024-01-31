import {
    ClassReference,
    Class_,
    Expression,
    GenericClassReference,
    HashReference,
    LongClassReference,
    Property,
    StringClassReference,
    Variable
} from "@fern-api/ruby-codegen";
import { HeadersGenerator } from "./HeadersGenerator";

export declare namespace RequestOptions {
    export interface Init {
        headersGenerator: HeadersGenerator;
    }
}

export class RequestOptions extends Class_ {
    public retryProperty: Property;
    public timeoutProperty: Property;
    public headerProperties: Property[];
    public additionalHeaderProperty: Property;
    public additionalQueryProperty: Property;
    public additionalBodyProperty: Property;

    constructor({ headersGenerator }: RequestOptions.Init) {
        const retryProperty = new Property({
            name: "max_retries",
            type: LongClassReference,
            isOptional: true,
            documentation: "The number of times to retry a failed request, defaults to 2."
        });
        const timeoutProperty = new Property({
            name: "timeout_in_seconds",
            type: LongClassReference,
            isOptional: true
        });
        const headerProperties = [
            // Auth headers
            ...headersGenerator.getAuthHeadersAsProperties(false),
            // Global headers
            ...headersGenerator.getAdditionalHeadersAsProperties(false)
        ];
        // Generic overrides
        const additionalHeaderProperty = new Property({
            name: "additional_headers",
            type: new HashReference({ keyType: StringClassReference, valueType: GenericClassReference }),
            isOptional: true
        });
        const additionalQueryProperty = new Property({
            name: "additional_query_parameters",
            type: new HashReference({ keyType: StringClassReference, valueType: GenericClassReference }),
            isOptional: true
        });
        const additionalBodyProperty = new Property({
            name: "additional_body_parameters",
            type: new HashReference({ keyType: StringClassReference, valueType: GenericClassReference }),
            isOptional: true
        });

        super({
            classReference: new ClassReference({ name: "RequestOptions", location: "requests" }),
            includeInitializer: true,
            properties: [
                retryProperty,
                timeoutProperty,
                ...headerProperties,
                additionalHeaderProperty,
                additionalQueryProperty,
                additionalBodyProperty
            ],
            documentation: "Additional options for request-specific configuration when calling APIs via the SDK."
        });

        this.retryProperty = retryProperty;
        this.timeoutProperty = timeoutProperty;
        this.headerProperties = headerProperties;
        this.additionalHeaderProperty = additionalHeaderProperty;
        this.additionalQueryProperty = additionalQueryProperty;
        this.additionalBodyProperty = additionalBodyProperty;
    }

    // TODO(P0): Finish this
    // These functions all essentially check if parameters are nil, and if not then add them to the overrides
    public getAdditionalRequestOverrides(): Expression[] {
        // .map(
        //     (prop) =>
        //         new ConditionalStatement({
        //             if_: {
        //                 rightSide: new FunctionInvocation({
        //                     // TODO: Do this field access on the client better
        //                     onObject: `${requestClientVariable.write()}.${prop.name}`,
        //                     baseFunction: new Function_({ name: "nil?", functionBody: [] })
        //                 }),
        //                 operation: "!",
        //                 expressions: [
        //                     new Expression({
        //                         leftSide: `${this.blockArg}.headers["${prop.wireValue ?? prop.name}"]`,
        //                         rightSide: `${requestClientVariable.write()}.${prop.name}`,
        //                         isAssignment: true
        //                     })
        //                 ]
        //             }
        //         })
        // )
        return [];
    }

    // Probably do conditional sets here as well
    public getAdditionalHeaderProperties(requestOptionsVariable: Variable): string {
        return `${requestOptionsVariable.write()}&.${this.additionalHeaderProperty.name}`;
    }

    // Just add to the map and compact it
    public getAdditionalQueryProperties(requestOptionsVariable: Variable): string {
        return `${requestOptionsVariable.write()}&.${this.additionalQueryProperty.name}`;
    }

    // Just add to the map and compact it
    public getAdditionalBodyProperties(requestOptionsVariable: Variable): string {
        return `${requestOptionsVariable.write()}&.${this.additionalBodyProperty.name}`;
    }
}
