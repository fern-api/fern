import {
    AdditionalPropertiesProperty,
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
    Expression,
    FieldsetProperty,
    FileClassReference,
    FunctionInvocation,
    Function_,
    GenericClassReference,
    HashInstance,
    HashReference,
    JsonClassReference,
    Parameter,
    Property,
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
    TypeId
} from "@fern-fern/ir-sdk/api";
import { FileUploadUtility } from "./FileUploadUtility";
import { IdempotencyRequestOptions } from "./IdempotencyRequestOptionsClass";
import { RequestOptions } from "./RequestOptionsClass";
import { isTypeOptional } from "./TypeUtilities";

export class EndpointGenerator {
    private endpoint: HttpEndpoint;
    private blockArg: string;
    private requestOptions: RequestOptions;
    private crf: ClassReferenceFactory;
    private requestOptionsVariable: Variable;

    private pathParametersAsProperties: Property[];
    private queryParametersAsProperties: Property[];
    private headersAsProperties: Property[];
    private bodyAsProperties: Property[];
    private streamProcessingBlock: Parameter | undefined;
    private fileUploadUtility: FileUploadUtility;

    private example: ExampleEndpointCall | undefined;

    constructor(
        endpoint: HttpEndpoint,
        requestOptionsVariable: Variable,
        requestOptions: RequestOptions | IdempotencyRequestOptions,
        crf: ClassReferenceFactory,
        generatedClasses: Map<TypeId, Class_>,
        fileUploadUtility: FileUploadUtility
    ) {
        this.endpoint = endpoint;
        this.example = endpoint.examples[0];

        this.blockArg = "req";
        this.requestOptions = requestOptions;
        this.crf = crf;

        this.requestOptionsVariable = requestOptionsVariable;

        const pathParameterExamples = (this.example?.rootPathParameters ?? [])
            .concat(this.example?.servicePathParameters ?? [])
            .concat(this.example?.endpointPathParameters ?? []);
        this.pathParametersAsProperties = this.endpoint.allPathParameters.map(
            (pp) =>
                new Property({
                    name: pp.name.snakeCase.safeName,
                    type: crf.fromTypeReference(pp.valueType),
                    isOptional: isTypeOptional(pp.valueType),
                    documentation: pp.docs,
                    shouldCastExample: true,
                    example: pathParameterExamples.find((param) => pp.name === param.name)?.value.jsonExample
                })
        );

        this.queryParametersAsProperties = this.endpoint.queryParameters.map(
            (qp) =>
                new Property({
                    name: qp.name.name.snakeCase.safeName,
                    wireValue: qp.name.wireValue,
                    type: crf.fromTypeReference(qp.valueType),
                    isOptional: isTypeOptional(qp.valueType),
                    documentation: qp.docs,
                    shouldCastExample: true,
                    example: this.example?.queryParameters.find((param) => qp.name === param.name)?.value.jsonExample
                })
        );

        const headerExamples = (this.example?.serviceHeaders ?? []).concat(this.example?.endpointHeaders ?? []);
        this.headersAsProperties = this.endpoint.headers.map(
            (header) =>
                new Property({
                    name: header.name.name.snakeCase.safeName,
                    wireValue: header.name.wireValue,
                    type: crf.fromTypeReference(header.valueType),
                    isOptional: isTypeOptional(header.valueType),
                    example: headerExamples.find((he) => header.name === he.name)?.value.jsonExample
                })
        );

        const defaultBodyParameterName = "body";
        this.bodyAsProperties =
            this.endpoint.requestBody
                ?._visit<Property[]>({
                    inlinedRequestBody: (irb: InlinedRequestBody) => {
                        const properties: Property[] = irb.extends
                            .flatMap((dtn) => generatedClasses.get(dtn.typeId)?.properties)
                            .filter((p) => p !== undefined) as Property[];
                        const exampleRequestProperties =
                            this.example?.request?.type === "inlinedRequestBody"
                                ? this.example.request.properties
                                : undefined;
                        return [
                            ...properties,
                            ...irb.properties.map((prop) => {
                                return new Property({
                                    name: prop.name.name.snakeCase.safeName,
                                    wireValue: prop.name.wireValue,
                                    type: crf.fromTypeReference(prop.valueType),
                                    isOptional: isTypeOptional(prop.valueType),
                                    documentation: prop instanceof Property ? prop.documentation : prop.docs,
                                    shouldCastExample: true,
                                    example: exampleRequestProperties?.find((erp) => prop.name === erp.name)?.value
                                        .jsonExample
                                });
                            })
                        ];
                    },
                    reference: (rbr: HttpRequestBodyReference) => {
                        return [
                            new Property({
                                name:
                                    this.endpoint.sdkRequest?.requestParameterName.snakeCase.safeName ??
                                    defaultBodyParameterName,
                                type: crf.fromTypeReference(rbr.requestBodyType),
                                isOptional: isTypeOptional(rbr.requestBodyType),
                                documentation: rbr.docs,
                                shouldCastExample: true,
                                example: this.example?.request?.jsonExample
                            })
                        ];
                    },
                    fileUpload: (fur: FileUploadRequest) => {
                        return fur.properties.map((prop) => {
                            return prop._visit<Property>({
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
                            });
                        });
                    },
                    bytes: (br: BytesRequest) => {
                        return [
                            new Property({
                                name:
                                    this.endpoint.sdkRequest?.requestParameterName.snakeCase.safeName ??
                                    defaultBodyParameterName,
                                type: [B64StringClassReference, FileClassReference],
                                isOptional: br.isOptional,
                                documentation: "Base64 encoded bytes, or an IO object (e.g. Faraday::UploadIO, etc.)"
                            })
                        ];
                    },
                    _other: () => {
                        throw new Error("Unknown request body type.");
                    }
                })
                .filter(
                    (prop) => prop.name !== AdditionalPropertiesProperty.name && prop.name !== FieldsetProperty.name
                ) ?? [];

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

    public getFaradayHeaders(): AstNode[] {
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
        return [
            ...idempotencyHeaders,
            new Expression({
                leftSide: headerArg,
                rightSide: new HashInstance({
                    contents: new Map(
                        this.headersAsProperties.map((header) => [
                            `"${header.wireValue}"`,
                            header.toVariable(VariableType.LOCAL)
                        ])
                    ),
                    // Expand the existing headers hash, then the additionalheaders params
                    additionalHashes: [
                        { value: "req.headers" },
                        { value: additionalHeadersProperty, defaultValue: "{}" }
                    ],
                    shouldCompact: true
                }),
                isAssignment: true
            })
        ];
    }

    public getFaradayParameters(): Expression | undefined {
        const additionalQueryProperty = this.requestOptions.getAdditionalQueryProperties(this.requestOptionsVariable);
        return this.queryParametersAsProperties.length > 0
            ? new Expression({
                  leftSide: `${this.blockArg}.params`,
                  rightSide: new HashInstance({
                      contents: new Map(
                          this.queryParametersAsProperties.map((qp) => [
                              `"${qp.wireValue}"`,
                              qp.toVariable(VariableType.LOCAL)
                          ])
                      ),
                      additionalHashes: [{ value: additionalQueryProperty, defaultValue: "{}" }],
                      shouldCompact: true
                  }),
                  isAssignment: true
              })
            : undefined;
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
                    const inlineHash = new HashInstance({
                        contents: new Map(
                            this.bodyAsProperties.map((prop) => [
                                prop.wireValue ?? prop.name,
                                prop.toVariable(VariableType.LOCAL)
                            ])
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
        }
        return;
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
            ...this.getFaradayHeaders()
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
                    response: () => [responseCr.fromJson(responseVariableBody) ?? responseVariableBody],
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
