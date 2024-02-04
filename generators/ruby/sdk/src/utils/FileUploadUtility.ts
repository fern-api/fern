import {
    Argument,
    ClassReference,
    Class_,
    ConditionalStatement,
    Expression,
    FileClassReference,
    FunctionInvocation,
    Function_,
    GenericClassReference,
    Import,
    Property,
    StringClassReference,
    Variable,
    VariableType
} from "@fern-api/ruby-codegen";

export class FileUploadUtility extends Class_ {
    public convertToFaradayMultipart: Function_;
    constructor() {
        const fileProperty = new Property({
            name: "file_like",
            documentation: "The file to be uploaded, or a string path to the file.",
            type: [StringClassReference, FileClassReference]
        });
        const fileVariable = fileProperty.toVariable(VariableType.LOCAL);
        const pathVariable = new Variable({
            name: "path",
            type: StringClassReference,
            variableType: VariableType.LOCAL
        });
        const mimeTypeVariable = new Variable({
            name: "mime_type",
            type: GenericClassReference,
            variableType: VariableType.LOCAL
        });
        const faradayFilePartCr = new ClassReference({
            name: "Faraday::Multipart::FilePart",
            import_: new Import({ from: "faraday/multipart", isExternal: true })
        });
        const convertToFaradayMultipart = new Function_({
            name: "as_faraday_multipart",
            isStatic: true,
            functionBody: [
                // Get file path in conditional
                new ConditionalStatement({
                    if_: {
                        leftSide: new FunctionInvocation({
                            onObject: fileVariable,
                            baseFunction: new Function_({ name: "has_attribute?", functionBody: [] }),
                            arguments_: [new Argument({ value: "path", type: StringClassReference, isNamed: false })]
                        }),
                        expressions: [
                            new Expression({
                                leftSide: pathVariable,
                                rightSide: `${fileVariable.write({})}.path`,
                                isAssignment: true
                            })
                        ]
                    },
                    else_: [
                        new Expression({
                            leftSide: pathVariable,
                            rightSide: fileVariable,
                            isAssignment: true
                        })
                    ]
                }),
                // Get file mimestype
                new Expression({
                    leftSide: mimeTypeVariable,
                    rightSide: new FunctionInvocation({
                        onObject: new ClassReference({
                            name: "MiniMime",
                            import_: new Import({ from: "mini_mime", isExternal: true })
                        }),
                        baseFunction: new Function_({ name: "lookup_by_filename", functionBody: [] }),
                        arguments_: [new Argument({ value: pathVariable, type: StringClassReference, isNamed: false })]
                    }),
                    isAssignment: true
                }),
                // Default mimetype
                new ConditionalStatement({
                    if_: {
                        leftSide: new FunctionInvocation({
                            onObject: mimeTypeVariable,
                            baseFunction: new Function_({ name: "nil?", functionBody: [] })
                        }),
                        operation: "!",
                        expressions: [
                            new Expression({
                                leftSide: mimeTypeVariable,
                                rightSide: `${mimeTypeVariable.write({})}.content_type`,
                                isAssignment: true
                            })
                        ]
                    },
                    else_: [
                        new Expression({
                            leftSide: mimeTypeVariable,
                            rightSide: "application/octet-stream",
                            isAssignment: true
                        })
                    ]
                }),
                new FunctionInvocation({
                    onObject: faradayFilePartCr,
                    baseFunction: new Function_({ name: "new", functionBody: [] }),
                    arguments_: [
                        new Argument({
                            value: fileVariable,
                            type: FileClassReference,
                            isNamed: false
                        }),
                        new Argument({
                            value: mimeTypeVariable,
                            type: StringClassReference,
                            isNamed: false
                        })
                    ]
                })
            ],
            parameters: [fileProperty.toParameter({})],
            returnValue: faradayFilePartCr
        });

        super({
            classReference: new ClassReference({
                name: "FileUtilities",
                import_: new Import({ from: "core/file_utilties", isExternal: false })
            }),
            includeInitializer: false,
            properties: [],
            documentation: "Utility class for managing files.",
            functions: [convertToFaradayMultipart]
        });

        this.convertToFaradayMultipart = convertToFaradayMultipart;
    }
}
