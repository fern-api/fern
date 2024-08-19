import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace WellKnownProtoValueGenerator {
    interface Args {
        context: ModelGeneratorContext;
        classReference: csharp.ClassReference;
        typeDeclaration: TypeDeclaration;
        wellKnownProtoValueType: csharp.Type;
        wellKnownProtoStructType: csharp.Type;
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
    private wellKnownProtoValueType: csharp.Type;
    private wellKnownProtoStructType: csharp.Type;

    constructor({
        context,
        classReference,
        typeDeclaration,
        wellKnownProtoValueType,
        wellKnownProtoStructType
    }: WellKnownProtoValueGenerator.Args) {
        super(context);
        this.classReference = classReference;
        this.typeDeclaration = typeDeclaration;
        this.wellKnownProtoValueType = wellKnownProtoValueType;
        this.wellKnownProtoStructType = wellKnownProtoStructType;
    }

    public doGenerate(): CSharpFile {
        const oneOfTypes = this.getProtoValueOneOfTypes();
        const class_ = csharp.class_({
            name: this.classReference.name,
            namespace: this.classReference.namespace,
            access: "public",
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

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getProtoValueOneOfTypes(): csharp.Type[] {
        return [
            csharp.Type.string(),
            csharp.Type.double(),
            csharp.Type.boolean(),
            csharp.Type.list(csharp.Type.optional(this.wellKnownProtoValueType)),
            this.wellKnownProtoStructType
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
                parameterType: this.wellKnownProtoStructType,
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
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValue()))
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
            parameters: [
                csharp.parameter({
                    name: "value",
                    type: operatorSpec.parameterType
                })
            ],
            body: operatorSpec.body
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
            trueStatement: node,
            falseStatement: csharp.codeblock("null")
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
