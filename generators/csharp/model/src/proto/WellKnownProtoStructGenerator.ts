import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { EXTERNAL_PROTO_STRUCT_CLASS_REFERENCE } from "./constants";

export declare namespace WellKnownProtoStructGenerator {
    interface Args {
        context: ModelGeneratorContext;
        classReference: csharp.ClassReference;
        typeDeclaration: TypeDeclaration;
        protoValueClassReference: csharp.ClassReference;
    }
}

export class WellKnownProtoStructGenerator extends FileGenerator<
    CSharpFile,
    ModelCustomConfigSchema,
    ModelGeneratorContext
> {
    private classReference: csharp.ClassReference;
    private typeDeclaration: TypeDeclaration;
    private protoValueClassReference: csharp.ClassReference;

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
        const class_ = csharp.class_({
            name: this.classReference.name,
            namespace: this.classReference.namespace,
            access: csharp.Access.Public,
            sealed: true,
            parentClassReference: csharp.Type.map(
                csharp.Type.string(),
                csharp.Type.optional(csharp.Type.reference(this.protoValueClassReference))
            ),
            summary: this.typeDeclaration.docs
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

    private getDefaultConstructor(): csharp.Class.Constructor {
        return {
            access: csharp.Access.Public,
            parameters: []
        };
    }

    private getKeyValuePairConstructor(): csharp.Class.Constructor {
        return {
            access: csharp.Access.Public,
            parameters: [
                csharp.parameter({
                    name: "value",
                    type: csharp.Type.list(
                        csharp.Type.keyValuePair(
                            csharp.Type.string(),
                            csharp.Type.optional(csharp.Type.reference(this.protoValueClassReference))
                        )
                    )
                })
            ],
            baseConstructorCall: csharp.invokeMethod({
                method: "base",
                arguments_: [
                    csharp.codeblock((writer) => {
                        writer.writeNode(
                            csharp.invokeMethod({
                                on: csharp.codeblock("value"),
                                method: "ToDictionary",
                                arguments_: [csharp.codeblock("e => e.Key, e => e.Value")]
                            })
                        );
                    })
                ]
            })
        };
    }

    private getToProtoMethod(): csharp.Method {
        return csharp.method({
            name: "ToProto",
            access: csharp.Access.Internal,
            isAsync: false,
            parameters: [],
            return_: csharp.Type.reference(EXTERNAL_PROTO_STRUCT_CLASS_REFERENCE),
            body: csharp.codeblock((writer) => {
                writer.write("var result = ");
                writer.writeNodeStatement(
                    csharp.instantiateClass({
                        classReference: EXTERNAL_PROTO_STRUCT_CLASS_REFERENCE,
                        arguments_: []
                    })
                );
                writer.controlFlow("foreach", csharp.codeblock("var kvp in this"));
                writer.write("result.Fields[kvp.Key] = ");
                writer.writeNodeStatement(
                    csharp.invokeMethod({
                        on: csharp.codeblock("kvp.Value?"),
                        method: "ToProto",
                        arguments_: []
                    })
                );
                writer.endControlFlow();
                writer.writeLine("return result;");
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
                    type: csharp.Type.reference(EXTERNAL_PROTO_STRUCT_CLASS_REFERENCE)
                })
            ],
            return_: csharp.Type.reference(this.classReference),
            body: csharp.codeblock((writer) => {
                writer.write("var result = ");
                writer.writeNodeStatement(
                    csharp.instantiateClass({
                        classReference: this.classReference,
                        arguments_: []
                    })
                );
                writer.controlFlow("foreach", csharp.codeblock("var kvp in value.Fields"));
                writer.write("result[kvp.Key] = ");
                writer.writeNodeStatement(
                    csharp.ternary({
                        condition: csharp.codeblock("kvp.Value != null"),
                        true_: csharp.invokeMethod({
                            on: this.protoValueClassReference,
                            method: "FromProto",
                            arguments_: [csharp.codeblock("kvp.Value")]
                        }),
                        false_: csharp.codeblock("null")
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
