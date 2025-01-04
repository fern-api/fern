import {
    AliasReference,
    Argument,
    ArrayReference,
    AstNode,
    B64StringClassReference,
    BlockConfiguration,
    ClassReference,
    ClassReferenceFactory,
    Class_,
    ConditionalStatement,
    DateReference,
    ExampleGenerator,
    Expression,
    FileClassReference,
    FunctionInvocation,
    Function_,
    GenericClassReference,
    HashInstance,
    HashReference,
    JsonClassReference,
    LiteralClassReference,
    Parameter,
    Property,
    SerializableObject,
    StringClassReference,
    Variable,
    VariableType,
    VoidClassReference
} from "@fern-api/ruby-codegen";

import {
    BytesRequest,
    ExampleEndpointCall,
    FileProperty,
    FileUploadRequest,
    HttpEndpoint,
    HttpRequestBodyReference,
    InlinedRequestBody,
    InlinedRequestBodyProperty,
    JsonResponse,
    JsonResponseBodyWithProperty,
    TypeId,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { FileUploadUtility } from "./FileUploadUtility";
import { IdempotencyRequestOptions } from "./IdempotencyRequestOptionsClass";
import { RequestOptions } from "./RequestOptionsClass";
import { isTypeOptional } from "./TypeUtilities";

export class EndpointGenerator {
    public endpointHasExamples: boolean;

    private endpoint: HttpEndpoint;
    private blockArg: string;
    private requestOptions: RequestOptions;
    private crf: ClassReferenceFactory;
    private eg: ExampleGenerator;
    private requestOptionsVariable: Variable;

    private pathParametersAsProperties: Property[];
    private queryParametersAsProperties: Property[];
    private headersAsProperties: Property[];
    private bodyAsProperties: Property[];

    private pathLiteralsAsProperties: Map<string, LiteralClassReference>;
    private queryLiteralsAsProperties: Map<string, LiteralClassReference>;
    private headersLiteralsAsProperties: Map<string, LiteralClassReference>;
    private bodyLiteralsAsProperties: Map<string, LiteralClassReference>;

    private streamProcessingBlock: Parameter | undefined;
    private fileUploadUtility: FileUploadUtility;

    public example: ExampleEndpointCall | undefined;

    constructor(
        endpoint: HttpEndpoint,
        requestOptionsVariable: Variable,
        requestOptions: RequestOptions | IdempotencyRequestOptions,
        crf: ClassReferenceFactory,
        eg: ExampleGenerator,
        generatedClasses: Map<TypeId, Class_>,
        fileUploadUtility: FileUploadUtility
    ) {
        this.endpoint = endpoint;
        this.example = endpoint.examples[0];
        this.endpointHasExamples = this.example !== undefined;
        this.eg = eg;
        this.blockArg = "req";
        this.requestOptions = requestOptions;
        this.crf = crf;

        this.requestOptionsVariable = requestOptionsVariable;

        const pathParameterExamples = (this.example?.rootPathParameters ?? [])
            .concat(this.example?.servicePathParameters ?? [])
            .concat(this.example?.endpointPathParameters ?? []);
        this.pathParametersAsProperties = [];
        this.pathLiteralsAsProperties = new Map();
        this.endpoint.allPathParameters.forEach((pp) => {
            if (this.referenceIsLiteral(pp.valueType)) {
                this.pathLiteralsAsProperties.set(
                    pp.name.snakeCase.safeName,
                    crf.fromTypeReference(pp.valueType) as LiteralClassReference
                );
            } else {
                const ppEx = this.eg.convertExampleTypeReference(
                    pathParameterExamples.find((param) => pp.name.originalName === param.name.originalName)?.value
                );
                this.pathParametersAsProperties.push(
                    new Property({
                        name: pp.name.snakeCase.safeName,
                        type: crf.fromTypeReference(pp.valueType),
                        isOptional: isTypeOptional(pp.valueType),
                        documentation: pp.docs,
                        example: ppEx
                    })
                );
            }
        });

        this.queryParametersAsProperties = [];
        this.queryLiteralsAsProperties = new Map();
        this.endpoint.queryParameters.forEach((qp) => {
            if (this.referenceIsLiteral(qp.valueType)) {
                this.queryLiteralsAsProperties.set(
                    qp.name.wireValue,
                    crf.fromTypeReference(qp.valueType) as LiteralClassReference
                );
            } else {
                const qpEx = this.eg.convertExampleTypeReference(
                    this.example?.queryParameters.find((param) => qp.name.wireValue === param.name.wireValue)?.value
                );

                this.queryParametersAsProperties.push(
                    new Property({
                        name: qp.name.name.snakeCase.safeName,
                        wireValue: qp.name.wireValue,
                        type: crf.fromTypeReference(qp.valueType),
                        isOptional: isTypeOptional(qp.valueType),
                        documentation: qp.docs,
                        example: qpEx
                    })
                );
            }
        });

        this.headersAsProperties = [];
        this.headersLiteralsAsProperties = new Map();
        const headerExamples = (this.example?.serviceHeaders ?? []).concat(this.example?.endpointHeaders ?? []);
        this.endpoint.headers.forEach((header) => {
            if (this.referenceIsLiteral(header.valueType)) {
                this.headersLiteralsAsProperties.set(
                    header.name.wireValue,
                    crf.fromTypeReference(header.valueType) as LiteralClassReference
                );
            } else {
                const headerEx = this.eg.convertExampleTypeReference(
                    headerExamples.find((he) => header.name.wireValue === he.name.wireValue)?.value
                );
                this.headersAsProperties.push(
                    new Property({
                        name: header.name.name.snakeCase.safeName,
                        wireValue: header.name.wireValue,
                        type: crf.fromTypeReference(header.valueType),
                        isOptional: isTypeOptional(header.valueType),
                        example: headerEx
                    })
                );
            }
        });

        const defaultBodyParameterName = "body";
        this.bodyAsProperties = [];
        this.bodyLiteralsAsProperties = new Map();
        this.endpoint.requestBody?._visit({
            inlinedRequestBody: (irb: InlinedRequestBody) => {
                const properties: Property[] = irb.extends
                    .flatMap((dtn) => generatedClasses.get(dtn.typeId)?.properties)
                    .filter((p) => p !== undefined) as Property[];
                const exampleRequestProperties =
                    this.example?.request?.type === "inlinedRequestBody" ? this.example.request.properties : undefined;
                const allProperties = [
                    ...properties,
                    ...irb.properties.map((prop) => {
                        const requestEx = this.eg.convertExampleTypeReference(
                            exampleRequestProperties?.find((erp) => prop.name.wireValue === erp.name.wireValue)?.value
                        );
                        return new Property({
                            name: prop.name.name.snakeCase.safeName,
                            wireValue: prop.name.wireValue,
                            type: crf.fromTypeReference(prop.valueType),
                            isOptional: isTypeOptional(prop.valueType),
                            documentation: prop instanceof Property ? prop.documentation : prop.docs,
                            example: requestEx
                        });
                    })
                ];

                allProperties.forEach((prop) => {
                    if (prop.type.length === 1 && prop.type[0] instanceof LiteralClassReference) {
                        if (prop.wireValue != null) {
                            this.bodyLiteralsAsProperties.set(prop.wireValue, prop.type[0] as LiteralClassReference);
                        }
                    } else {
                        this.bodyAsProperties.push(prop);
                    }
                });
            },
            reference: (rbr: HttpRequestBodyReference) => {
                const requestEx = this.eg.convertExampleTypeReference(
                    this.example?.request?.type === "reference" ? this.example.request : undefined
                );
                if (!this.referenceIsLiteral(rbr.requestBodyType)) {
                    this.bodyAsProperties.push(
                        new Property({
                            name:
                                this.endpoint.sdkRequest?.requestParameterName.snakeCase.safeName ??
                                defaultBodyParameterName,
                            type: crf.fromTypeReference(rbr.requestBodyType),
                            isOptional: isTypeOptional(rbr.requestBodyType),
                            documentation: rbr.docs,
                            example: requestEx
                        })
                    );
                } else {
                    this.bodyLiteralsAsProperties.set(
                        this.endpoint.sdkRequest?.requestParameterName.snakeCase.safeName ?? defaultBodyParameterName,
                        crf.fromTypeReference(rbr.requestBodyType) as LiteralClassReference
                    );
                }
            },
            fileUpload: (fur: FileUploadRequest) => {
                return fur.properties.forEach((prop) => {
                    this.bodyAsProperties.push(
                        prop._visit<Property>({
                            file: (fp: FileProperty) =>
                                new Property({
                                    name: fp.key.name.snakeCase.safeName,
                                    isOptional: fp.isOptional,
                                    wireValue: fp.key.wireValue,
                                    type: [StringClassReference, FileClassReference],
                                    example: "my_file.txt"
                                }),
                            // TODO: add examples for fileUpload parameters
                            bodyProperty: (irbp: InlinedRequestBodyProperty) =>
                                new Property({
                                    name: irbp.name.name.snakeCase.safeName,
                                    isOptional: isTypeOptional(irbp.valueType),
                                    wireValue: irbp.name.wireValue,
                                    type: crf.fromTypeReference(irbp.valueType),
                                    documentation: irbp.docs
                                }),
                            _other: () => {
                                throw new Error("Unknown file upload property type.");
                            }
                        })
                    );
                });
            },
            bytes: (br: BytesRequest) => {
                this.bodyAsProperties.push(
                    new Property({
                        name:
                            this.endpoint.sdkRequest?.requestParameterName.snakeCase.safeName ??
                            defaultBodyParameterName,
                        type: [B64StringClassReference, FileClassReference],
                        isOptional: br.isOptional,
                        documentation: "Base64 encoded bytes, or an IO object (e.g. Faraday::UploadIO, etc.)"
                    })
                );
            },
            _other: () => {
                throw new Error("Unknown request body type.");
            }
        });

        // Remove reserved properties from the function signature
        this.bodyAsProperties = this.bodyAsProperties.filter(
            (prop) => !SerializableObject.INTERNAL_FIELDS.includes(prop.name)
        );

        this.streamProcessingBlock = this.isStreamingResponse()
            ? new Parameter({
                  name: "on_data",
                  type: GenericClassReference,
                  isBlock: true,
                  documentation:
                      "[chunk, overall_received_bytes, env] Leverage the Faraday on_data callback which will receive tuples of strings, the sum of characters received so far, and the response environment. The latter will allow access to the response status, headers and reason, as well as the request info."
              })
            : undefined;

        this.fileUploadUtility = fileUploadUtility;
    }

    private referenceIsLiteral(typeReference: TypeReference): boolean {
        return typeReference.type === "container" && typeReference.container.type === "literal";
    }

    public getEndpointParameters(): Parameter[] {
        const params = [
            ...this.headersAsProperties.map((headerProp) => headerProp.toParameter({ describeAsHashInYardoc: true })),
            ...this.pathParametersAsProperties.map((pathProp) =>
                pathProp.toParameter({ describeAsHashInYardoc: true })
            ),
            ...this.queryParametersAsProperties.map((queryProp) =>
                queryProp.toParameter({ describeAsHashInYardoc: true })
            ),
            ...this.bodyAsProperties.map((bodyProp) => bodyProp.toParameter({ describeAsHashInYardoc: true })),
            // Optional request_options, e.g. the per-request customizer, optional
            new Parameter({
                name: this.requestOptionsVariable.name,
                type: this.requestOptionsVariable.type,
                isOptional: true
            })
        ];
        if (this.streamProcessingBlock !== undefined) {
            params.push(this.streamProcessingBlock);
        }
        return params;
    }

    public getFaradayHeaders(requestClientVariable: Variable): AstNode[] {
        const headerArg = `${this.blockArg}.headers`;
        const additionalHeadersProperty = this.requestOptions.getAdditionalHeaderProperties(
            this.requestOptionsVariable
        );
        const idempotencyHeaders = [];
        if (this.requestOptions instanceof IdempotencyRequestOptions) {
            idempotencyHeaders.push(
                ...this.requestOptions.getIdempotencyHeadersProperties(this.requestOptionsVariable, headerArg)
            );
        }

        const literalHeaders = new Map(
            Array.from(this.headersLiteralsAsProperties.entries()).map(([key, value]) => [
                `"${key}"`,
                value.getLiteralValue()
            ])
        );
        const inputHeaders = new Map(
            this.headersAsProperties.map((header) => [`"${header.wireValue}"`, header.toVariable(VariableType.LOCAL)])
        );
        return [
            ...idempotencyHeaders,
            new Expression({
                leftSide: headerArg,
                rightSide: new HashInstance({
                    contents: new Map<string, string | AstNode>([
                        ...Array.from(literalHeaders.entries()),
                        ...Array.from(inputHeaders.entries())
                    ]),
                    // Expand the existing headers hash, then the additionalheaders params
                    additionalHashes: [
                        { value: "req.headers", defaultValue: "{}" },
                        { value: `${requestClientVariable.write({})}.get_headers` },
                        { value: additionalHeadersProperty, defaultValue: "{}" }
                    ],
                    shouldCompact: true,
                    stringifyValues: false
                }),
                isAssignment: true
            })
        ];
    }

    public getFaradayParameters(): AstNode | undefined {
        const additionalQueryProperty = this.requestOptions.getAdditionalQueryProperties(this.requestOptionsVariable);

        const literalQueryParams = new Map(
            Array.from(this.queryLiteralsAsProperties.entries()).map(([key, value]) => [
                `"${key}"`,
                value.getLiteralValue()
            ])
        );
        const inputQueryParams = new Map(
            this.queryParametersAsProperties.map((qp) => [`"${qp.wireValue}"`, qp.toVariable(VariableType.LOCAL)])
        );

        return this.queryParametersAsProperties.length > 0
            ? new Expression({
                  leftSide: `${this.blockArg}.params`,
                  rightSide: new HashInstance({
                      contents: new Map<string, string | AstNode>([
                          ...Array.from(literalQueryParams.entries()),
                          ...Array.from(inputQueryParams.entries())
                      ]),
                      additionalHashes: [{ value: additionalQueryProperty, defaultValue: "{}" }],
                      shouldCompact: true,
                      stringifyValues: false
                  }),
                  isAssignment: true
              })
            : new ConditionalStatement({
                  if_: {
                      negated: true,
                      leftSide: new FunctionInvocation({
                          onObject: this.requestOptionsVariable,
                          baseFunction: new Function_({
                              name: "nil?",
                              functionBody: []
                          }),
                          optionalSafeCall: false
                      }),
                      operation: "||",
                      rightSide: new FunctionInvocation({
                          onObject: additionalQueryProperty,
                          baseFunction: new Function_({
                              name: "nil?",
                              functionBody: []
                          }),
                          optionalSafeCall: false
                      }),
                      expressions: [
                          new Expression({
                              leftSide: `${this.blockArg}.params`,
                              rightSide: new HashInstance({
                                  additionalHashes: [{ value: additionalQueryProperty, defaultValue: "{}" }],
                                  shouldCompact: true,
                                  stringifyValues: false
                              }),
                              isAssignment: true
                          })
                      ]
                  }
              });
    }

    private getFaradayBodyForReference(additionalBodyProperty: string): AstNode[] {
        const prop = this.bodyAsProperties[0];
        if (prop === undefined) {
            throw new Error("No body properties found.");
        }

        const referenceBodyHash = new HashInstance({
            additionalHashes: [
                { value: prop.name, defaultValue: "{}" },
                { value: additionalBodyProperty, defaultValue: "{}" }
            ],
            shouldCompact: true
        });
        return [
            new Expression({
                leftSide: `${this.blockArg}.body`,
                rightSide: referenceBodyHash,
                isAssignment: true
            })
        ];
    }

    private getFaradayBodyForBytes(): AstNode[] {
        const prop = this.bodyAsProperties[0];
        if (prop === undefined) {
            throw new Error("No body properties found.");
        }

        return [
            new Expression({
                leftSide: `${this.blockArg}.body`,
                rightSide: prop.name,
                isAssignment: true
            })
        ];
    }

    public getFaradayBody(): AstNode[] | undefined {
        const additionalBodyProperty = this.requestOptions.getAdditionalBodyProperties(this.requestOptionsVariable);
        if (this.endpoint.requestBody !== undefined) {
            return this.endpoint.requestBody._visit<AstNode[]>({
                inlinedRequestBody: () => {
                    const literalBodyParams = new Map(
                        Array.from(this.bodyLiteralsAsProperties.entries()).map(([key, value]) => [
                            `"${key}"`,
                            value.getLiteralValue()
                        ])
                    );
                    const inputBodyParams = new Map(
                        this.bodyAsProperties.map((prop) => [
                            prop.wireValue ?? prop.name,
                            prop.toVariable(VariableType.LOCAL)
                        ])
                    );
                    const inlineHash = new HashInstance({
                        contents: new Map<string, string | AstNode>([
                            ...Array.from(literalBodyParams.entries()),
                            ...Array.from(inputBodyParams.entries())
                        ]),
                        additionalHashes: [{ value: additionalBodyProperty, defaultValue: "{}" }],
                        shouldCompact: true,
                        stringifyValues: false
                    });
                    return [
                        new Expression({
                            leftSide: `${this.blockArg}.body`,
                            rightSide: inlineHash,
                            isAssignment: true
                        })
                    ];
                },
                // Our inputs are hashes, so pass that in
                reference: () => this.getFaradayBodyForReference(additionalBodyProperty),
                fileUpload: () => {
                    const inlineHash = new HashInstance({
                        contents: new Map<string, AstNode>(
                            this.bodyAsProperties.map((prop) => {
                                const func = new FunctionInvocation({
                                    onObject: this.fileUploadUtility.classReference,
                                    baseFunction: this.fileUploadUtility.convertToFaradayMultipart,
                                    arguments_: [
                                        new Argument({
                                            value: prop.toVariable(VariableType.LOCAL),
                                            isNamed: true,
                                            name: "file_like"
                                        })
                                    ]
                                });
                                const isFileReference = prop.type.some((cr) => cr === FileClassReference);
                                if (isFileReference) {
                                    return [
                                        prop.wireValue ?? prop.name,
                                        prop.isOptional
                                            ? new ConditionalStatement({
                                                  if_: {
                                                      leftSide: new FunctionInvocation({
                                                          onObject: prop.toVariable(VariableType.LOCAL),
                                                          baseFunction: new Function_({
                                                              name: "nil?",
                                                              functionBody: []
                                                          }),
                                                          optionalSafeCall: false
                                                      }),
                                                      operation: "!",
                                                      expressions: [func]
                                                  }
                                              })
                                            : func
                                    ];
                                }
                                return [prop.wireValue ?? prop.name, prop.toVariable(VariableType.LOCAL)];
                            })
                        ),
                        additionalHashes: [{ value: additionalBodyProperty, defaultValue: "{}" }],
                        shouldCompact: true
                    });

                    return [
                        new Expression({
                            leftSide: `${this.blockArg}.body`,
                            rightSide: inlineHash,
                            isAssignment: true
                        })
                    ];
                },
                bytes: (br: BytesRequest) => {
                    return [
                        new Expression({
                            leftSide: `${this.blockArg}.headers['Content-Type']`,
                            rightSide: `"${br.contentType ?? "application/octet-stream"}"`,
                            isAssignment: true
                        }),
                        ...this.getFaradayBodyForBytes()
                    ];
                },
                _other: () => {
                    throw new Error("Unknown request body type.");
                }
            });
        } else {
            return [
                new ConditionalStatement({
                    if_: {
                        negated: true,
                        leftSide: new FunctionInvocation({
                            onObject: this.requestOptionsVariable,
                            baseFunction: new Function_({
                                name: "nil?",
                                functionBody: []
                            }),
                            optionalSafeCall: false
                        }),
                        operation: "||",
                        rightSide: new FunctionInvocation({
                            onObject: additionalBodyProperty,
                            baseFunction: new Function_({
                                name: "nil?",
                                functionBody: []
                            }),
                            optionalSafeCall: false
                        }),
                        expressions: [
                            new Expression({
                                leftSide: `${this.blockArg}.body`,
                                rightSide: new HashInstance({
                                    additionalHashes: [{ value: additionalBodyProperty, defaultValue: "{}" }],
                                    shouldCompact: true,
                                    stringifyValues: false
                                }),
                                isAssignment: true
                            })
                        ]
                    }
                })
            ];
        }
    }

    public getFaradayBlock(
        requestClientVariable: Variable,
        path: string,
        shouldOverwriteUrl: boolean
    ): BlockConfiguration {
        const expressions: AstNode[] = [
            ...this.requestOptions.getAdditionalRequestOverrides(this.requestOptionsVariable, this.blockArg),
            ...this.requestOptions.headerProperties.map(
                (prop) =>
                    new ConditionalStatement({
                        if_: {
                            rightSide: new FunctionInvocation({
                                // TODO: Do this field access on the client better
                                onObject: `${this.requestOptionsVariable.write({})}&.${prop.name}`,
                                baseFunction: new Function_({ name: "nil?", functionBody: [] })
                            }),
                            operation: "!",
                            expressions: [
                                new Expression({
                                    leftSide: `${this.blockArg}.headers["${prop.wireValue ?? prop.name}"]`,
                                    rightSide: `${this.requestOptionsVariable.write({})}.${prop.name}`,
                                    isAssignment: true
                                })
                            ]
                        }
                    })
            ),
            ...this.getFaradayHeaders(requestClientVariable)
        ];

        if (this.isStreamingResponse() && this.streamProcessingBlock !== undefined) {
            expressions.push(
                new Expression({
                    leftSide: `${this.blockArg}.options.on_data`,
                    rightSide: this.streamProcessingBlock.toVariable().write({}),
                    isAssignment: true
                })
            );
        }

        const parameters = this.getFaradayParameters();
        if (parameters !== undefined) {
            expressions.push(parameters);
        }

        const body = this.getFaradayBody();
        if (body !== undefined) {
            expressions.push(...body);
        }
        const getUrlParams = shouldOverwriteUrl
            ? `environment: ${this.endpoint.baseUrl}, request_options: ${this.requestOptionsVariable.name}`
            : `request_options: ${this.requestOptionsVariable.name}`;
        const url = new Expression({
            leftSide: `${this.blockArg}.url`,
            rightSide: `"#{${requestClientVariable.write({})}.get_url(${getUrlParams})}/${path}"`,
            isAssignment: false
        });
        if (url !== undefined) {
            expressions.push(url);
        }
        return {
            arguments: this.blockArg,
            expressions
        };
    }

    private isStreamingResponse(): boolean {
        return (
            this.endpoint.response?._visit<boolean>({
                json: () => false,
                fileDownload: () => true,
                streaming: () => true,
                text: () => false,
                _other: () => {
                    throw new Error("Unknown response type.");
                }
            }) ?? false
        );
    }

    public getResponseType(): ClassReference {
        return (
            this.endpoint.response?._visit<ClassReference>({
                json: (jr: JsonResponse) => this.crf.fromTypeReference(jr.responseBodyType),
                fileDownload: () => VoidClassReference,
                streaming: () => VoidClassReference,
                text: () => StringClassReference,
                _other: () => {
                    throw new Error("Unknown response type.");
                }
            }) ?? VoidClassReference
        );
    }

    public getResponseExpressions(responseVariable: Variable): AstNode[] | undefined {
        const responseVariableBody = new Variable({
            name: `${responseVariable.name}.body`,
            type: GenericClassReference,
            variableType: VariableType.LOCAL
        });
        return this.endpoint.response?._visit<AstNode[]>({
            json: (jr: JsonResponse) => {
                const responseCr = this.crf.fromTypeReference(jr.responseBodyType);
                return jr._visit<AstNode[]>({
                    response: () => {
                        const hasFromJson =
                            responseCr.fromJson(responseVariableBody) !== undefined &&
                            !(responseCr instanceof ArrayReference) &&
                            !(responseCr instanceof HashReference) &&
                            !(responseCr instanceof DateReference) &&
                            !(
                                responseCr instanceof AliasReference &&
                                (responseCr.aliasOf instanceof ArrayReference ||
                                    responseCr.aliasOf instanceof HashReference ||
                                    responseCr.aliasOf instanceof DateReference)
                            );
                        if (hasFromJson) {
                            return [responseCr.fromJson(responseVariableBody) ?? responseVariableBody];
                        }

                        const parsedJsonVariable = new Variable({
                            name: "parsed_json",
                            type: GenericClassReference,
                            variableType: VariableType.LOCAL
                        });
                        return [
                            new Expression({
                                leftSide: parsedJsonVariable,
                                rightSide: new FunctionInvocation({
                                    onObject: JsonClassReference,
                                    baseFunction: new Function_({ name: "parse", functionBody: [] }),
                                    arguments_: [
                                        new Argument({
                                            value: responseVariableBody,
                                            isNamed: false
                                        })
                                    ]
                                }),
                                isAssignment: true
                            }),
                            responseCr.fromJson(parsedJsonVariable) ?? parsedJsonVariable
                        ];
                    },
                    nestedPropertyAsResponse: (jrbwp: JsonResponseBodyWithProperty) => {
                        if (jrbwp.responseProperty !== undefined) {
                            // Turn to struct, then get the field, then reconvert to JSON (to_json)
                            const nestedResponseValueVariable = new Variable({
                                name: "nested_response_json",
                                type: GenericClassReference,
                                variableType: VariableType.LOCAL
                            });
                            const parsingExpressions = [
                                new Expression({
                                    leftSide: "parsed_json",
                                    rightSide: new FunctionInvocation({
                                        onObject: JsonClassReference,
                                        baseFunction: new Function_({ name: "parse", functionBody: [] }),
                                        arguments_: [
                                            new Argument({
                                                value: responseVariableBody,
                                                isNamed: false
                                            })
                                        ]
                                    }),
                                    isAssignment: true
                                })
                            ];
                            const hasFromJson =
                                responseCr.fromJson(nestedResponseValueVariable) !== undefined &&
                                !(responseCr instanceof ArrayReference) &&
                                !(responseCr instanceof HashReference) &&
                                !(responseCr instanceof DateReference) &&
                                !(
                                    responseCr instanceof AliasReference &&
                                    (responseCr.aliasOf instanceof ArrayReference ||
                                        responseCr.aliasOf instanceof HashReference ||
                                        responseCr.aliasOf instanceof DateReference)
                                );

                            if (hasFromJson) {
                                parsingExpressions.push(
                                    new Expression({
                                        leftSide: nestedResponseValueVariable,
                                        rightSide: `parsed_json["${jrbwp.responseProperty.name.wireValue}"].to_json`,
                                        isAssignment: true
                                    })
                                );
                            }
                            return [
                                ...parsingExpressions,
                                responseCr.fromJson(nestedResponseValueVariable) ?? nestedResponseValueVariable
                            ];
                        } else {
                            return [responseCr.fromJson(responseVariableBody) ?? responseVariableBody];
                        }
                    },
                    _other: () => {
                        throw new Error("Unknown response type.");
                    }
                });
            },
            fileDownload: () => [],
            streaming: () => {
                throw new Error("Streaming not yet supported.");
            },
            text: () => [responseVariableBody],
            _other: () => {
                throw new Error("Unknown response type.");
            }
        });
    }

    // TODO: log this skipping
    public static isStreamingResponse(endpoint: HttpEndpoint): boolean {
        return (
            endpoint.response?._visit<boolean>({
                json: () => false,
                fileDownload: () => false,
                streaming: () => true,
                text: () => false,
                _other: () => false
            }) ?? false
        );
    }
}
