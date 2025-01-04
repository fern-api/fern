import {
    ClassReferenceFactory,
    ConditionalStatement,
    Expression,
    FunctionInvocation,
    Function_,
    Property,
    Variable
} from "@fern-api/ruby-codegen";

import { HttpHeader } from "@fern-fern/ir-sdk/api";

import { RequestOptions } from "./RequestOptionsClass";

export declare namespace IdempotencyRequestOptions {
    export interface Init extends RequestOptions.Init {
        crf: ClassReferenceFactory;
        idempotencyHeaders: HttpHeader[];
    }
}

// TODO: Implrement this, also figure out the best way to handle the headerGenerator concept
export class IdempotencyRequestOptions extends RequestOptions {
    public idempotencyHeaderProperties: Property[];

    constructor({ idempotencyHeaders, crf, ...rest }: IdempotencyRequestOptions.Init) {
        const idempotencyHeaderProperties = idempotencyHeaders.map(
            (header) =>
                new Property({
                    name: header.name.name.snakeCase.safeName,
                    wireValue: header.name.wireValue,
                    type: crf.fromTypeReference(header.valueType),
                    isOptional: true,
                    documentation: header.docs
                })
        );
        super({
            nameOverride: "IdempotencyRequestOptions",
            ...rest,
            additionalProperties: idempotencyHeaderProperties
        });

        this.idempotencyHeaderProperties = idempotencyHeaderProperties;
    }

    public getIdempotencyHeadersProperties(
        requestOptionsVariable: Variable,
        faradayHeadersArg: string
    ): ConditionalStatement[] {
        return this.idempotencyHeaderProperties.map(
            (header) =>
                new ConditionalStatement({
                    if_: {
                        rightSide: new FunctionInvocation({
                            // TODO: Do this field access on the client better
                            onObject: `${requestOptionsVariable.write({})}&.${header.name}`,
                            baseFunction: new Function_({ name: "nil?", functionBody: [] })
                        }),
                        operation: "!",
                        expressions: [
                            new Expression({
                                leftSide: `${faradayHeadersArg}["${header.wireValue}"]`,
                                rightSide: `${requestOptionsVariable.write({})}.${header.name}`,
                                isAssignment: true
                            })
                        ]
                    }
                })
        );
    }
}
