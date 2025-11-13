import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace WellKnownProtoValueGenerator {
    interface Args {
        context: ModelGeneratorContext;
        classReference: ast.ClassReference;
        typeDeclaration: TypeDeclaration;
        protoStructClassReference: ast.ClassReference;
    }
}

interface OperatorSpec {
    parameterType: ast.Type;
    body: ast.CodeBlock;
}

export class WellKnownProtoValueGenerator extends FileGenerator<CSharpFile, ModelGeneratorContext> {
    private classReference: ast.ClassReference;
    private typeDeclaration: TypeDeclaration;
    private protoStructClassReference: ast.ClassReference;

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
        const class_ = this.csharp.class_({
            name: this.classReference.name,
            namespace: this.classReference.namespace,
            access: ast.Access.Public,
            sealed: true,
            parentClassReference: this.OneOf.OneOfBase(oneOfTypes),
            summary: this.typeDeclaration.docs,
            primaryConstructor: {
                parameters: [
                    this.csharp.parameter({
                        name: "value",
                        type: this.OneOf.OneOf(oneOfTypes)
                    })
                ],
                superClassArguments: [this.csharp.codeblock("value")]
            },
            annotations: [this.System.Serializable]
        });

        for (const operator of this.getProtoValueOperators()) {
            class_.addOperator(operator);
        }

        this.context.getToStringMethod(class_);
        this.getToProtoMethod(class_);
        this.getFromProtoMethod(class_);

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    private getToProtoMethod(cls: ast.Class): ast.Method {
        return cls.addMethod({
            name: "ToProto",
            access: ast.Access.Internal,
            isAsync: false,
            parameters: [],
            return_: this.Google.Protobuf.WellKnownTypes.Value,
            body: this.csharp.codeblock((writer) => {
                writer.write("return ");
                writer.writeNodeStatement(
                    this.csharp.invokeMethod({
                        method: "Match",
                        generics: [this.Google.Protobuf.WellKnownTypes.Value],
                        arguments_: [
                            this.csharp.codeblock((writer) => {
                                writer.writeNode(this.Google.Protobuf.WellKnownTypes.Value);
                                writer.write(".ForString");
                            }),
                            this.csharp.codeblock((writer) => {
                                writer.writeNode(this.Google.Protobuf.WellKnownTypes.Value);
                                writer.write(".ForNumber");
                            }),
                            this.csharp.codeblock((writer) => {
                                writer.writeNode(this.Google.Protobuf.WellKnownTypes.Value);
                                writer.write(".ForBool");
                            }),
                            this.csharp.codeblock((writer) => {
                                writer.write("list => new ");
                                writer.writeNode(this.Google.Protobuf.WellKnownTypes.Value);
                                writer.write(" { ListValue = new ");
                                writer.writeNode(this.Google.Protobuf.WellKnownTypes.ListValue);
                                writer.write(" { Values = { list.Select(item => item?.ToProto()) } } }");
                            }),
                            this.csharp.codeblock((writer) => {
                                writer.write("nested => new ");
                                writer.writeNode(this.Google.Protobuf.WellKnownTypes.Value);
                                writer.write(" { StructValue = ");
                                writer.writeNode(
                                    this.csharp.invokeMethod({
                                        on: this.csharp.codeblock("nested"),
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

    private getFromProtoMethod(cls: ast.Class): ast.Method {
        return cls.addMethod({
            name: "FromProto",
            access: ast.Access.Internal,
            type: ast.MethodType.STATIC,
            isAsync: false,
            parameters: [
                this.csharp.parameter({
                    name: "value",
                    type: this.Google.Protobuf.WellKnownTypes.Value
                })
            ],
            return_: this.classReference.asOptional(),
            body: this.csharp.codeblock((writer) => {
                writer.write("return ");
                writer.writeNodeStatement(
                    this.csharp.switch_({
                        condition: this.csharp.codeblock("value.KindCase"),
                        cases: [
                            {
                                label: this.csharp.codeblock((writer) => {
                                    writer.writeNode(this.Google.Protobuf.WellKnownTypes.Value);
                                    writer.write(".KindOneofCase.StringValue");
                                }),
                                value: this.csharp.codeblock("value.StringValue")
                            },
                            {
                                label: this.csharp.codeblock((writer) => {
                                    writer.writeNode(this.Google.Protobuf.WellKnownTypes.Value);
                                    writer.write(".KindOneofCase.NumberValue");
                                }),
                                value: this.csharp.codeblock("value.NumberValue")
                            },
                            {
                                label: this.csharp.codeblock((writer) => {
                                    writer.writeNode(this.Google.Protobuf.WellKnownTypes.Value);
                                    writer.write(".KindOneofCase.BoolValue");
                                }),
                                value: this.csharp.codeblock("value.BoolValue")
                            },
                            {
                                label: this.csharp.codeblock((writer) => {
                                    writer.writeNode(this.Google.Protobuf.WellKnownTypes.Value);
                                    writer.write(".KindOneofCase.ListValue");
                                }),
                                value: this.csharp.codeblock("value.ListValue.Values.Select(FromProto).ToList()")
                            },
                            {
                                label: this.csharp.codeblock((writer) => {
                                    writer.writeNode(this.Google.Protobuf.WellKnownTypes.Value);
                                    writer.write(".KindOneofCase.StructValue");
                                }),
                                value: this.csharp.invokeMethod({
                                    on: this.protoStructClassReference,
                                    method: "FromProto",
                                    arguments_: [this.csharp.codeblock("value.StructValue")]
                                })
                            },
                            {
                                label: this.csharp.codeblock("_"),
                                value: this.csharp.codeblock("null")
                            }
                        ]
                    })
                );
            })
        });
    }

    private getProtoValueOneOfTypes(): ast.Type[] {
        return [
            this.Primitive.string,
            this.Primitive.double,
            this.Primitive.boolean,
            this.Collection.list(this.classReference.asOptional()),
            this.protoStructClassReference
        ];
    }

    private getProtoValueOperators(): ast.Class.Operator[] {
        const operatorSpecs: OperatorSpec[] = [
            {
                parameterType: this.Primitive.string,
                body: this.newValue()
            },
            {
                parameterType: this.Primitive.boolean,
                body: this.newValue()
            },
            {
                parameterType: this.Primitive.double,
                body: this.newValue()
            },
            {
                parameterType: this.protoStructClassReference,
                body: this.newValue()
            },
            {
                parameterType: this.Collection.array(this.classReference.asOptional()),
                body: this.newValue()
            },
            {
                parameterType: this.Collection.listType(this.classReference.asOptional()),
                body: this.newValue()
            },
            {
                parameterType: this.Collection.array(this.Primitive.string),

                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: this.Collection.array(this.Primitive.double),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: this.Collection.array(this.Primitive.double.asOptional()),
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValueWithOptional()))
            },
            {
                parameterType: this.Collection.array(this.Primitive.boolean),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: this.Collection.array(this.Primitive.boolean.asOptional()),
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValueWithOptional()))
            },
            {
                parameterType: this.Collection.listType(this.Primitive.string),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: this.Collection.listType(this.Primitive.double),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: this.Collection.listType(this.Primitive.double.asOptional()),
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValueWithOptional()))
            },
            {
                parameterType: this.Collection.listType(this.Primitive.boolean),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: this.Collection.listType(this.Primitive.boolean.asOptional()),
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValueWithOptional()))
            }
        ];
        return operatorSpecs.map((operatorSpec) => ({
            type: "implicit",
            parameter: this.csharp.parameter({
                name: "value",
                type: operatorSpec.parameterType
            }),
            body: operatorSpec.body,
            useExpressionBody: true
        }));
    }

    private newValue(): ast.CodeBlock {
        return this.csharp.codeblock("new(value)");
    }

    private linqMap(node: ast.AstNode): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.write("new(value.Select(v => ");
            writer.writeNode(node);
            writer.write(").ToList())");
        });
    }

    private wrapTernary(node: ast.AstNode): ast.AstNode {
        return this.csharp.ternary({
            condition: this.csharp.codeblock("v != null"),
            true_: node,
            false_: this.csharp.codeblock("null")
        });
    }

    private instantiateProtoValue(): ast.ClassInstantiation {
        return this.csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: [this.csharp.codeblock("v")]
        });
    }

    private instantiateProtoValueWithOptional(): ast.ClassInstantiation {
        return this.csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: [this.csharp.codeblock("v.Value")]
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
