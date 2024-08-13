import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { ResolvedWellKnownProtoType } from "./resolvers/ResolvedWellKnownProtoType";

export declare namespace WellKnownProtoValueGenerator {
    interface Args {
        context: SdkGeneratorContext;
        wellKnownProtoValue: ResolvedWellKnownProtoType;
        wellKnownProtoStruct: ResolvedWellKnownProtoType;
    }
}

interface OperatorSpec {
    parameterType: csharp.Type;
    body: csharp.CodeBlock;
}

export class WellKnownProtoValueGenerator extends FileGenerator<
    CSharpFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private wellKnownProtoValue: ResolvedWellKnownProtoType;
    private wellKnownProtoValueClassReference: csharp.ClassReference;
    private wellKnownProtoValueType: csharp.Type;
    private wellKnownProtoStructType: csharp.Type;

    constructor({ context, wellKnownProtoValue }: WellKnownProtoValueGenerator.Args) {
        super(context);
        this.wellKnownProtoValue = wellKnownProtoValue;
        this.wellKnownProtoValueClassReference = this.context.csharpTypeMapper.convertToClassReference(
            this.wellKnownProtoValue.typeDeclaration.name
        );
        this.wellKnownProtoValueType = csharp.Type.reference(this.wellKnownProtoValueClassReference);
        this.wellKnownProtoStructType = csharp.Type.map(
            csharp.Type.string(),
            csharp.Type.optional(this.wellKnownProtoValueType)
        );
    }

    public doGenerate(): CSharpFile {
        const oneOfTypes = this.getProtoValueOneOfTypes();
        const class_ = csharp.class_({
            name: this.wellKnownProtoValueClassReference.name,
            namespace: this.wellKnownProtoValueClassReference.namespace,
            access: "public",
            parentClassReference: csharp.Type.oneOfBase(oneOfTypes),
            summary: this.wellKnownProtoValue.typeDeclaration.docs,
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
            directory: this.context.getDirectoryForTypeId(this.wellKnownProtoValue.typeDeclaration.name.typeId),
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
                parameterType: csharp.Type.array(
                    csharp.Type.optional(csharp.Type.reference(this.wellKnownProtoValueClassReference))
                ),
                body: this.newValue()
            },
            {
                parameterType: csharp.Type.listType(
                    csharp.Type.optional(csharp.Type.reference(this.wellKnownProtoValueClassReference))
                ),
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
            classReference: this.wellKnownProtoValueClassReference,
            arguments_: [csharp.codeblock("v")]
        });
    }

    private instantiateProtoValueWithOptional(): csharp.ClassInstantiation {
        return csharp.instantiateClass({
            classReference: this.wellKnownProtoValueClassReference,
            arguments_: [csharp.codeblock("v.Value")]
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.wellKnownProtoValueClassReference.name + ".cs")
        );
    }
}
