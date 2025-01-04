import {
    ClassReference,
    Class_,
    ConditionalStatement,
    Expression,
    FunctionInvocation,
    Function_,
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
        nameOverride?: string;
        additionalProperties?: Property[];
        clientName: string;
    }
}

export class RequestOptions extends Class_ {
    public timeoutProperty: Property;
    public headerProperties: Property[];
    public additionalHeaderProperty: Property;
    public additionalQueryProperty: Property;
    public additionalBodyProperty: Property;
    public baseUrlProperty: Property;

    constructor({ nameOverride, headersGenerator, additionalProperties, clientName }: RequestOptions.Init) {
        const timeoutProperty = new Property({
            name: "timeout_in_seconds",
            type: LongClassReference,
            isOptional: true
        });
        const headerProperties = [
            // Auth headers
            ...headersGenerator.getAuthHeadersAsProperties(true),
            // Global headers
            ...headersGenerator.getAdditionalHeadersAsProperties(true)
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
        const baseUrlProperty = new Property({
            name: "base_url",
            type: StringClassReference,
            isOptional: true
        });

        super({
            classReference: new ClassReference({
                name: nameOverride ?? "RequestOptions",
                location: "requests",
                moduleBreadcrumbs: [clientName]
            }),
            includeInitializer: true,
            properties: [
                baseUrlProperty,
                ...headerProperties,
                additionalHeaderProperty,
                additionalQueryProperty,
                additionalBodyProperty,
                timeoutProperty,
                ...(additionalProperties ?? [])
            ],
            documentation: "Additional options for request-specific configuration when calling APIs via the SDK."
        });

        this.timeoutProperty = timeoutProperty;
        this.headerProperties = headerProperties;
        this.additionalHeaderProperty = additionalHeaderProperty;
        this.additionalQueryProperty = additionalQueryProperty;
        this.additionalBodyProperty = additionalBodyProperty;
        this.baseUrlProperty = baseUrlProperty;
    }

    // These functions all essentially check if parameters are nil, and if not then add them to the overrides
    public getAdditionalRequestOverrides(
        requestOptionsVariable: Variable,
        faradayBlockArg: string
    ): ConditionalStatement[] {
        return [
            new ConditionalStatement({
                if_: {
                    rightSide: new FunctionInvocation({
                        // TODO: Do this field access on the client better
                        onObject: `${requestOptionsVariable.write({})}&.${this.timeoutProperty.name}`,
                        baseFunction: new Function_({ name: "nil?", functionBody: [] })
                    }),
                    operation: "!",
                    expressions: [
                        new Expression({
                            leftSide: `${faradayBlockArg}.options.timeout`,
                            rightSide: `${requestOptionsVariable.write({})}.${this.timeoutProperty.name}`,
                            isAssignment: true
                        })
                    ]
                }
            })
        ];
    }

    // Probably do conditional sets here as well
    public getAdditionalHeaderProperties(requestOptionsVariable: Variable): string {
        return `${requestOptionsVariable.write({})}&.${this.additionalHeaderProperty.name}`;
    }

    // Just add to the map and compact it
    public getAdditionalQueryProperties(requestOptionsVariable: Variable): string {
        return `${requestOptionsVariable.write({})}&.${this.additionalQueryProperty.name}`;
    }

    // Just add to the map and compact it
    public getAdditionalBodyProperties(requestOptionsVariable: Variable): string {
        return `${requestOptionsVariable.write({})}&.${this.additionalBodyProperty.name}`;
    }

    public getBaseUrlProperty(requestOptionsVariable: Variable): string {
        return `${requestOptionsVariable.write({})}&.${this.baseUrlProperty.name}`;
    }
}
