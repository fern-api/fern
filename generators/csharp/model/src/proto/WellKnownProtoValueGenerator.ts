import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { EXTERNAL_PROTO_LIST_VALUE_CLASS_REFERENCE, EXTERNAL_PROTO_VALUE_CLASS_REFERENCE } from "./constants";

export declare namespace WellKnownProtoValueGenerator {
    interface Args {
        context: ModelGeneratorContext;
        classReference: csharp.ClassReference;
        typeDeclaration: TypeDeclaration;
        protoStructClassReference: csharp.ClassReference;
    }
}

interface OperatorSpec {
    parameterType: csharp.Type;
    body: csharp.CodeBlock;
}

export class WellKnownProtoValueGenerator extends FileGenerator<
    CSharpFile,
    ModelCustomConfigSchema,
    ModelGeneratorContext
> {
    private classReference: csharp.ClassReference;
    private typeDeclaration: TypeDeclaration;
    private protoStructClassReference: csharp.ClassReference;

    constructor({
        context,
        classReference,
        typeDeclaration,
        protoStructClassReference
    }: WellKnownProtoValueGenerator.Args) {
        super(context);
        this.classReference = classReference;
        this.typeDeclaration = typeDeclaration;
        this.protoStructClassReference = protoStructClassReference;
    }

    public doGenerate(): CSharpFile {
        const oneOfTypes = this.getProtoValueOneOfTypes();
        const class_ = csharp.class_({
            name: this.classReference.name,
            namespace: this.classReference.namespace,
            access: csharp.Access.Public,
            sealed: true,
            parentClassReference: csharp.Type.oneOfBase(oneOfTypes),
            summary: this.typeDeclaration.docs,
            primaryConstructor: {
                parameters: [
                    csharp.parameter({
                        name: "value",
                        type: csharp.Type.oneOf(oneOfTypes)
                    })
                ],
                superClassArguments: [csharp.codeblock("value")]
            }
        });

        for (const operator of this.getProtoValueOperators()) {
            class_.addOperator(operator);
        }

        class_.addMethod(this.context.getToStringMethod());
        class_.addMethod(this.getToProtoMethod());
        class_.addMethod(this.getFromProtoMethod());

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getToProtoMethod(): csharp.Method {
        return csharp.method({
            name: "ToProto",
            access: csharp.Access.Internal,
            isAsync: false,
            parameters: [],
            return_: csharp.Type.reference(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE),
            body: csharp.codeblock((writer) => {
                writer.write("return ");
                writer.writeNodeStatement(
                    csharp.invokeMethod({
                        method: "Match",
                        generics: [csharp.Type.reference(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE)],
                        arguments_: [
                            csharp.codeblock((writer) => {
                                writer.writeNode(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE);
                                writer.write(".ForString");
                            }),
                            csharp.codeblock((writer) => {
                                writer.writeNode(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE);
                                writer.write(".ForNumber");
                            }),
                            csharp.codeblock((writer) => {
                                writer.writeNode(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE);
                                writer.write(".ForBool");
                            }),
                            csharp.codeblock((writer) => {
                                writer.write("list => new ");
                                writer.writeNode(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE);
                                writer.write(" { ListValue = new ");
                                writer.writeNode(EXTERNAL_PROTO_LIST_VALUE_CLASS_REFERENCE);
                                writer.write(" { Values = { list.Select(item => item?.ToProto()) } } }");
                            }),
                            csharp.codeblock((writer) => {
                                writer.write("nested => new ");
                                writer.writeNode(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE);
                                writer.write(" { StructValue = ");
                                writer.writeNode(
                                    csharp.invokeMethod({
                                        on: csharp.codeblock("nested"),
                                        method: "ToProto",
                                        arguments_: []
                                    })
                                );
                                writer.write(" }");
                            })
                        ]
                    })
                );
            })
        });
    }

    private getFromProtoMethod(): csharp.Method {
        return csharp.method({
            name: "FromProto",
            access: csharp.Access.Internal,
            type: csharp.MethodType.STATIC,
            isAsync: false,
            parameters: [
                csharp.parameter({
                    name: "value",
                    type: csharp.Type.reference(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE)
                })
            ],
            return_: csharp.Type.optional(csharp.Type.reference(this.classReference)),
            body: csharp.codeblock((writer) => {
                writer.write("return ");
                writer.writeNodeStatement(
                    csharp.switch_({
                        condition: csharp.codeblock("value.KindCase"),
                        cases: [
                            {
                                label: csharp.codeblock((writer) => {
                                    writer.writeNode(csharp.Type.reference(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE));
                                    writer.write(".KindOneofCase.StringValue");
                                }),
                                value: csharp.codeblock("value.StringValue")
                            },
                            {
                                label: csharp.codeblock((writer) => {
                                    writer.writeNode(csharp.Type.reference(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE));
                                    writer.write(".KindOneofCase.NumberValue");
                                }),
                                value: csharp.codeblock("value.NumberValue")
                            },
                            {
                                label: csharp.codeblock((writer) => {
                                    writer.writeNode(csharp.Type.reference(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE));
                                    writer.write(".KindOneofCase.BoolValue");
                                }),
                                value: csharp.codeblock("value.BoolValue")
                            },
                            {
                                label: csharp.codeblock((writer) => {
                                    writer.writeNode(csharp.Type.reference(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE));
                                    writer.write(".KindOneofCase.ListValue");
                                }),
                                value: csharp.codeblock("value.ListValue.Values.Select(FromProto).ToList()")
                            },
                            {
                                label: csharp.codeblock((writer) => {
                                    writer.writeNode(csharp.Type.reference(EXTERNAL_PROTO_VALUE_CLASS_REFERENCE));
                                    writer.write(".KindOneofCase.StructValue");
                                }),
                                value: csharp.invokeMethod({
                                    on: this.protoStructClassReference,
                                    method: "FromProto",
                                    arguments_: [csharp.codeblock("value.StructValue")]
                                })
                            },
                            {
                                label: csharp.codeblock("_"),
                                value: csharp.codeblock("null")
                            }
                        ]
                    })
                );
            })
        });
    }

    private getProtoValueOneOfTypes(): csharp.Type[] {
        return [
            csharp.Type.string(),
            csharp.Type.double(),
            csharp.Type.boolean(),
            csharp.Type.list(csharp.Type.optional(csharp.Type.reference(this.classReference))),
            csharp.Type.reference(this.protoStructClassReference)
        ];
    }

    private getProtoValueOperators(): csharp.Class.Operator[] {
        const operatorSpecs: OperatorSpec[] = [
            {
                parameterType: csharp.Type.string(),
                body: this.newValue()
            },
            {
                parameterType: csharp.Type.boolean(),
                body: this.newValue()
            },
            {
                parameterType: csharp.Type.double(),
                body: this.newValue()
            },
            {
                parameterType: csharp.Type.reference(this.protoStructClassReference),
                body: this.newValue()
            },
            {
                parameterType: csharp.Type.array(csharp.Type.optional(csharp.Type.reference(this.classReference))),
                body: this.newValue()
            },
            {
                parameterType: csharp.Type.listType(csharp.Type.optional(csharp.Type.reference(this.classReference))),
                body: this.newValue()
            },
            {
                parameterType: csharp.Type.array(csharp.Type.string()),

                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: csharp.Type.array(csharp.Type.double()),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: csharp.Type.array(csharp.Type.optional(csharp.Type.double())),
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValueWithOptional()))
            },
            {
                parameterType: csharp.Type.array(csharp.Type.boolean()),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: csharp.Type.array(csharp.Type.optional(csharp.Type.boolean())),
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValueWithOptional()))
            },
            {
                parameterType: csharp.Type.listType(csharp.Type.string()),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: csharp.Type.listType(csharp.Type.double()),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: csharp.Type.listType(csharp.Type.optional(csharp.Type.double())),
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValueWithOptional()))
            },
            {
                parameterType: csharp.Type.listType(csharp.Type.boolean()),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: csharp.Type.listType(csharp.Type.optional(csharp.Type.boolean())),
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValueWithOptional()))
            }
        ];
        return operatorSpecs.map((operatorSpec) => ({
            type: "implicit",
            parameter: csharp.parameter({
                name: "value",
                type: operatorSpec.parameterType
            }),
            body: operatorSpec.body,
            useExpressionBody: true
        }));
    }

    private newValue(): csharp.CodeBlock {
        return csharp.codeblock("new(value)");
    }

    private linqMap(node: csharp.AstNode): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.write("new(value.Select(v => ");
            writer.writeNode(node);
            writer.write(").ToList())");
        });
    }

    private wrapTernary(node: csharp.AstNode): csharp.AstNode {
        return csharp.ternary({
            condition: csharp.codeblock("v != null"),
            true_: node,
            false_: csharp.codeblock("null")
        });
    }

    private instantiateProtoValue(): csharp.ClassInstantiation {
        return csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: [csharp.codeblock("v")]
        });
    }

    private instantiateProtoValueWithOptional(): csharp.ClassInstantiation {
        return csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: [csharp.codeblock("v.Value")]
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
