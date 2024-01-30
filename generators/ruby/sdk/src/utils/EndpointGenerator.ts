import {
    Argument,
    AstNode,
    BlockConfiguration,
    ClassReference,
    ClassReferenceFactory,
    ConditionalStatement,
    Expression,
    FunctionInvocation,
    Function_,
    GenericClassReference,
    HashInstance,
    JsonClassReference,
    OpenStructClassReference,
    Parameter,
    Property,
    StringClassReference,
    Variable,
    VariableType,
    VoidClassReference
} from "@fern-api/ruby-codegen";
import {
    HttpEndpoint,
    HttpRequestBodyReference,
    InlinedRequestBody,
    JsonResponse,
    JsonResponseBodyWithProperty
} from "@fern-fern/ir-sdk/api";
import { RequestOptions } from "./RequestOptionsClass";
import { isTypeOptional } from "./TypeUtilities";

export class EndpointGenerator {
    private endpoint: HttpEndpoint;
    private blockArg: string;
    private requestOptions: RequestOptions;
    private crf: ClassReferenceFactory;

    private pathParametersAsProperties: Property[];
    private queryParametersAsProperties: Property[];
    private headersAsProperties: Property[];
    private bodyAsProperties: Property[];

    constructor(endpoint: HttpEndpoint, requestOptions: RequestOptions, crf: ClassReferenceFactory) {
        this.endpoint = endpoint;
        this.blockArg = "req";
        this.requestOptions = requestOptions;
        this.crf = crf;

        this.pathParametersAsProperties = this.endpoint.allPathParameters.map(
            (pp) =>
                new Property({
                    name: pp.name.snakeCase.safeName,
                    type: crf.fromTypeReference(pp.valueType),
                    isOptional: isTypeOptional(pp.valueType)
                })
        );
        this.queryParametersAsProperties = this.endpoint.queryParameters.map(
            (qp) =>
                new Property({
                    name: qp.name.name.snakeCase.safeName,
                    wireValue: qp.name.wireValue,
                    type: crf.fromTypeReference(qp.valueType),
                    isOptional: isTypeOptional(qp.valueType)
                })
        );
        this.headersAsProperties = this.endpoint.headers.map(
            (header) =>
                new Property({
                    name: header.name.name.snakeCase.safeName,
                    wireValue: header.name.wireValue,
                    type: crf.fromTypeReference(header.valueType),
                    isOptional: isTypeOptional(header.valueType)
                })
        );

        const defaultBodyParameterName = "body";
        // TODO(P0): create a function on serializable objects to be able to convert them to yardoc typed hashes for params
        // ie, we need to type these as hashes as opposed to the actual type + have the yardoc reflect that
        this.bodyAsProperties =
            this.endpoint.requestBody?._visit<Property[]>({
                inlinedRequestBody: (irb: InlinedRequestBody) => {
                    // TODO(P0): How can we get the properties here, probably need TypesGenerator to provide Class_ objects
                    // const properties: Property[] = irb.extends.flatMap(dtn => crf.fromDeclaredTypeName(dtb).properties);
                    const properties: Property[] = [];
                    return [
                        ...properties,
                        ...irb.properties.map(
                            (prop) =>
                                new Property({
                                    name: prop.name.name.snakeCase.safeName,
                                    wireValue: prop.name.wireValue,
                                    type: crf.fromTypeReference(prop.valueType),
                                    isOptional: isTypeOptional(prop.valueType)
                                })
                        )
                    ];
                },
                reference: (_rbr: HttpRequestBodyReference) => [
                    new Property({
                        name:
                            this.endpoint.sdkRequest?.requestParameterName.snakeCase.safeName ??
                            defaultBodyParameterName,
                        type: crf.fromTypeReference(_rbr.requestBodyType),
                        isOptional: isTypeOptional(_rbr.requestBodyType)
                    })
                ],
                fileUpload: () => {
                    throw new Error("File upload not yet supported.");
                },
                bytes: () => {
                    throw new Error("Byte-inputs not yet supported.");
                },
                _other: () => {
                    throw new Error("Unknown request body type.");
                }
            }) ?? [];
    }

    public getEndpointParameters(): Parameter[] {
        return [
            ...this.pathParametersAsProperties.map((pathProp) => pathProp.toParameter()),
            ...this.queryParametersAsProperties.map((queryProp) => queryProp.toParameter()),
            ...this.headersAsProperties.map((headerProp) => headerProp.toParameter()),
            ...this.bodyAsProperties.map((bodyProp) => bodyProp.toParameter())
        ];
    }

    public getFaradayHeaders(): Expression[] {
        return this.headersAsProperties.map(
            (header) =>
                new Expression({
                    leftSide: `${this.blockArg}.headers["${header.wireValue}"]`,
                    rightSide: header.name,
                    isAssignment: true
                })
        );
    }
    public getFaradayParameters(): Expression | undefined {
        return this.queryParametersAsProperties.length > 0
            ? new Expression({
                  leftSide: `${this.blockArg}.params`,
                  rightSide: new HashInstance({
                      contents: new Map(this.queryParametersAsProperties.map((qp) => [`"${qp.wireValue}"`, qp.name])),
                      shouldCompact: true
                  }),
                  isAssignment: true
              })
            : undefined;
    }
    public getFaradayBody(): Expression | undefined {
        if (this.endpoint.requestBody !== undefined) {
            return this.endpoint.requestBody._visit<Expression>({
                inlinedRequestBody: () => {
                    const inlineHash = new HashInstance({
                        contents: new Map(
                            this.bodyAsProperties.map((prop) => [prop.wireValue ?? prop.name, prop.name])
                        ),
                        shouldCompact: true
                    });
                    return new Expression({
                        leftSide: `${this.blockArg}.body`,
                        rightSide: inlineHash,
                        isAssignment: true
                    });
                },
                // Our inputs are hashes, so pass that in
                reference: () =>
                    new Expression({
                        leftSide: `${this.blockArg}.body`,
                        rightSide: this.bodyAsProperties[0]!.name,
                        isAssignment: true
                    }),
                fileUpload: () => {
                    throw new Error("File upload not yet supported.");
                },
                bytes: () => {
                    throw new Error("Byte-inputs not yet supported.");
                },
                _other: () => {
                    throw new Error("Unknown request body type.");
                }
            });
        }
        return;
    }

    public getFaradayBlock(requestClientVariable: Variable): BlockConfiguration {
        const expressions = [
            ...this.requestOptions.getAdditionalRequestOverrides(),
            ...this.requestOptions.headerProperties.map(
                (prop) =>
                    new ConditionalStatement({
                        if_: {
                            rightSide: new FunctionInvocation({
                                // TODO: Do this field access on the client better
                                onObject: `${requestClientVariable.write()}.${prop.name}`,
                                baseFunction: new Function_({ name: "nil?", functionBody: [] })
                            }),
                            operation: "!",
                            expressions: [
                                new Expression({
                                    leftSide: `${this.blockArg}.headers["${prop.wireValue ?? prop.name}"]`,
                                    rightSide: `${requestClientVariable.write()}.${prop.name}`,
                                    isAssignment: true
                                })
                            ]
                        }
                    })
            ),
            ...this.requestOptions.getAdditionalHeaderProperties(),
            ...this.getFaradayHeaders()
        ];

        expressions.concat(this.requestOptions.getAdditionalQueryProperties());
        const parameters = this.getFaradayParameters();
        if (parameters !== undefined) {
            expressions.push(parameters);
        }

        expressions.concat(this.requestOptions.getAdditionalBodyProperties());
        const body = this.getFaradayBody();
        if (body !== undefined) {
            expressions.push(body);
        }
        const url =
            this.endpoint.baseUrl !== undefined
                ? new Expression({
                      leftSide: `${this.blockArg}.url`,
                      rightSide: `${requestClientVariable.write()}.default_environment[${this.endpoint.baseUrl}]`,
                      isAssignment: true
                  })
                : undefined;
        if (url !== undefined) {
            expressions.push(url);
        }
        return {
            arguments: this.blockArg,
            expressions
        };
    }

    public getResponseType(): ClassReference {
        return (
            this.endpoint.response?._visit<ClassReference>({
                json: (jr: JsonResponse) => this.crf.fromTypeReference(jr.responseBodyType),
                fileDownload: () => {
                    throw new Error("File download not yet supported.");
                },
                streaming: () => {
                    throw new Error("Streaming not yet supported.");
                },
                text: () => StringClassReference,
                _other: () => {
                    throw new Error("Unknown response type.");
                }
            }) ?? VoidClassReference
        );
    }

    public getResponseExpressions(responseVariable: Variable): AstNode[] | undefined {
        return this.endpoint.response?._visit<AstNode[]>({
            json: (jr: JsonResponse) => {
                const responseCr = this.crf.fromTypeReference(jr.responseBodyType);
                return jr._visit<AstNode[]>({
                    response: () => [responseCr.fromJson(responseVariable) ?? responseVariable],
                    nestedPropertyAsResponse: (jrbwp: JsonResponseBodyWithProperty) => {
                        if (jrbwp.responseProperty !== undefined) {
                            // Turn to struct, then get the field, then reconvert to JSON (to_h.to_json)
                            const nestedResponseValueVariable = new Variable({
                                name: "nested_response_json",
                                type: GenericClassReference,
                                variableType: VariableType.LOCAL
                            });
                            return [
                                new Expression({
                                    leftSide: nestedResponseValueVariable,
                                    rightSide: new FunctionInvocation({
                                        onObject: new FunctionInvocation({
                                            onObject: JsonClassReference,
                                            baseFunction: new Function_({ name: "parse", functionBody: [] }),
                                            arguments_: [
                                                new Argument({
                                                    value: "json_object",
                                                    type: GenericClassReference,
                                                    isNamed: false
                                                }),
                                                new Argument({
                                                    name: "object_class",
                                                    value: "OpenStruct",
                                                    type: OpenStructClassReference,
                                                    isNamed: true
                                                })
                                            ]
                                        }),
                                        baseFunction: new Function_({
                                            name: `${jrbwp.responseProperty.name.wireValue}.to_h.to_json`,
                                            functionBody: []
                                        })
                                    })
                                }),
                                responseCr.fromJson(nestedResponseValueVariable) ?? nestedResponseValueVariable
                            ];
                        } else {
                            return [responseCr.fromJson(responseVariable) ?? responseVariable];
                        }
                    },
                    _other: () => {
                        throw new Error("Unknown response type.");
                    }
                });
            },
            fileDownload: () => {
                throw new Error("File download not yet supported.");
            },
            streaming: () => {
                throw new Error("Streaming not yet supported.");
            },
            text: () => [responseVariable],
            _other: () => {
                throw new Error("Unknown response type.");
            }
        });
    }
}
