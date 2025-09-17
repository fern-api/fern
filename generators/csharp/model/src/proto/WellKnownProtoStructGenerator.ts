import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace WellKnownProtoStructGenerator {
    interface Args {
        context: ModelGeneratorContext;
        classReference: ast.ClassReference;
        typeDeclaration: TypeDeclaration;
        protoValueClassReference: ast.ClassReference;
    }
}

export class WellKnownProtoStructGenerator extends FileGenerator<
    CSharpFile,
    ModelCustomConfigSchema,
    ModelGeneratorContext
> {
    private classReference: ast.ClassReference;
    private typeDeclaration: TypeDeclaration;
    private protoValueClassReference: ast.ClassReference;

    constructor({
        context,
        classReference,
        typeDeclaration,
        protoValueClassReference
    }: WellKnownProtoStructGenerator.Args) {
        super(context);
        this.classReference = classReference;
        this.typeDeclaration = typeDeclaration;
        this.protoValueClassReference = protoValueClassReference;
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            name: this.classReference.name,
            namespace: this.classReference.namespace,
            access: ast.Access.Public,
            sealed: true,
            parentClassReference: this.csharp.Type.map(
                this.csharp.Type.string(),
                this.csharp.Type.optional(this.csharp.Type.reference(this.protoValueClassReference))
            ),
            summary: this.typeDeclaration.docs,
            annotations: [this.context.getSerializableAttribute()]
        });

        class_.addConstructor(this.getDefaultConstructor());
        class_.addConstructor(this.getKeyValuePairConstructor());

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

    private getDefaultConstructor(): ast.Class.Constructor {
        return {
            access: ast.Access.Public,
            parameters: []
        };
    }

    private getKeyValuePairConstructor(): ast.Class.Constructor {
        return {
            access: ast.Access.Public,
            parameters: [
                this.csharp.parameter({
                    name: "value",
                    type: this.csharp.Type.list(
                        this.csharp.Type.keyValuePair(
                            this.csharp.Type.string(),
                            this.csharp.Type.optional(this.csharp.Type.reference(this.protoValueClassReference))
                        )
                    )
                })
            ],
            baseConstructorCall: this.csharp.invokeMethod({
                method: "base",
                arguments_: [
                    this.csharp.codeblock((writer) => {
                        writer.writeNode(
                            this.csharp.invokeMethod({
                                on: this.csharp.codeblock("value"),
                                method: "ToDictionary",
                                arguments_: [this.csharp.codeblock("e => e.Key, e => e.Value")]
                            })
                        );
                    })
                ]
            })
        };
    }

    private getToProtoMethod(): ast.Method {
        return this.csharp.method({
            name: "ToProto",
            access: ast.Access.Internal,
            isAsync: false,
            parameters: [],
            return_: this.csharp.Type.reference(this.csharp.Google.Protobuf.WellKnownTypes.Struct),
            body: this.csharp.codeblock((writer) => {
                writer.write("var result = ");
                writer.writeNodeStatement(
                    this.csharp.instantiateClass({
                        classReference: this.csharp.Google.Protobuf.WellKnownTypes.Struct,
                        arguments_: []
                    })
                );
                writer.controlFlow("foreach", this.csharp.codeblock("var kvp in this"));
                writer.write("result.Fields[kvp.Key] = ");
                writer.writeNodeStatement(
                    this.csharp.invokeMethod({
                        on: this.csharp.codeblock("kvp.Value?"),
                        method: "ToProto",
                        arguments_: []
                    })
                );
                writer.endControlFlow();
                writer.writeLine("return result;");
            })
        });
    }

    private getFromProtoMethod(): ast.Method {
        return this.csharp.method({
            name: "FromProto",
            access: ast.Access.Internal,
            type: ast.MethodType.STATIC,
            isAsync: false,
            parameters: [
                this.csharp.parameter({
                    name: "value",
                    type: this.csharp.Type.reference(this.csharp.Google.Protobuf.WellKnownTypes.Struct)
                })
            ],
            return_: this.csharp.Type.reference(this.classReference),
            body: this.csharp.codeblock((writer) => {
                writer.write("var result = ");
                writer.writeNodeStatement(
                    this.csharp.instantiateClass({
                        classReference: this.classReference,
                        arguments_: []
                    })
                );
                writer.controlFlow("foreach", this.csharp.codeblock("var kvp in value.Fields"));
                writer.write("result[kvp.Key] = ");
                writer.writeNodeStatement(
                    this.csharp.ternary({
                        condition: this.csharp.codeblock("kvp.Value != null"),
                        true_: this.csharp.invokeMethod({
                            on: this.protoValueClassReference,
                            method: "FromProto",
                            arguments_: [this.csharp.codeblock("kvp.Value")]
                        }),
                        false_: this.csharp.codeblock("null")
                    })
                );
                writer.endControlFlow();
                writer.writeLine("return result;");
            })
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
