import { assertNever } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

// import { ExampleGenerator } from "../snippets/ExampleGenerator";

const basePropertiesClassName = "BaseProperties";

export class UnionGenerator extends FileGenerator<RubyFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: ruby.ClassReference;
    // private readonly exampleGenerator: ExampleGenerator;
    private readonly discriminantPropertyName: string;
    private readonly unionMemberTypeMap: Map<FernIr.SingleUnionType, ruby.Type>;

    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UnionTypeDeclaration
    ) {
        super(context);
        this.discriminantPropertyName = unionDeclaration.discriminant.name.snakeCase.safeName;
        const basePropNames = unionDeclaration.baseProperties.map((p) => p.name.name.snakeCase.safeName);

        if (basePropNames.includes(this.valuePropertyName)) {
            this.valuePropertyName = `${this.valuePropertyName}_`;
        }

        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.typeMapper.convertToClassReference(this.typeDeclaration.name);

        if (
            basePropNames.includes(this.discriminantPropertyName) ||
            this.classReference.name === this.discriminantPropertyName
        ) {
            this.discriminantPropertyName = `${this.discriminantPropertyName}_`;
        }

        // this.exampleGenerator = new ExampleGenerator(context);
        this.unionMemberTypeMap = new Map(
            unionDeclaration.types.map((type) => this.getRubyTypeMapEntry(type, context))
        );
    }

    public doGenerate(): RubyFile {
        const rootModule = this.context.getRootModule();
        const class_ = ruby.class_({
            ...this.classReference,
            superclass: ruby.classReference({
                name: "Union",
                modules: ["Internal", "Types"]
            }),
            docstring: this.typeDeclaration.docs ?? undefined
        });

        class_.addField(
            ruby.field({
                docs: "Discriminant value",
                type: ruby.Type.string(),
                name: this.discriminantPropertyName
            })
        );

        class_.addField(
            ruby.field({
                docs: "Discriminated union value",
                // TODO: probably wrong type
                type: ruby.Type.object(this.classReference.name),
                name: this.valuePropertyName
            })
        );

        rootModule.addStatement(class_);
        return new RubyFile({
            node: ruby.withComments(rootModule, [ruby.frozenStringLiteral]),
            directory: this.getFilepath(),
            filename: this.getFilename(),
            customConfig: this.context.customConfig
        });
    }

    // private getUnionTypeClassReferenceType(type: FernIr.SingleUnionType): ruby.Type {
    //     return ruby.Type.reference(this.getUnionTypeClassReference(type));
    // }

    // private getUnionTypeClassReferenceTypeByTypeName(typeName: string): ruby.Type {
    //     return ruby.Type.reference(this.getUnionTypeClassReferenceByTypeName(typeName));
    // }

    // private getUnionTypeClassReference(type: FernIr.SingleUnionType): ruby.ClassReference {
    //     return ruby.classReference({
    //         namespace: this.classReference.namespace,
    //         name: `${this.classReference.name}.${this.getUnionTypeClassName(type)}`
    //     });
    // }

    // private getUnionTypeClassReferenceByTypeName(type: string): ruby.ClassReference {
    //     return ruby.classReference({
    //         namespace: this.classReference.namespace,
    //         name: `${this.classReference.name}.${this.getUnionTypeClassNameByTypeName(type)}`
    //     });
    // }

    // private getUnionTypeClassName(type: FernIr.SingleUnionType): string {
    //     return this.getUnionTypeClassNameByTypeName(type.discriminantValue.name.pascalCase.safeName);
    // }

    // private getUnionTypeClassNameByTypeName(typeName: string): string {
    //     if (["Value", "Type"].includes(typeName)) {
    //         return `${typeName}Inner`;
    //     }
    //     return typeName;
    // }

    // private getRubyType(type: FernIr.SingleUnionType): ruby.Type {
    //     const rubyType = this.unionMemberTypeMap.get(type);
    //     if (rubyType === undefined) {
    //         throw new Error("Could not find Ruby type for SingleUnionType");
    //     }
    //     return rubyType;
    // }

    private getRubyTypeMapEntry(
        type: FernIr.SingleUnionType,
        context: ModelGeneratorContext
    ): [FernIr.SingleUnionType, ruby.Type] {
        switch (type.shape.propertiesType) {
            case "noProperties":
                return [type, ruby.Type.object("TODO")];
            case "samePropertiesAsObject":
                return [
                    type,
                    ruby.Type.reference(
                        context.typeMapper.convertToClassReference(type.shape, { fullyQualified: true })
                    )
                ];
            case "singleProperty":
                return [
                    type,
                    context.typeMapper.convert({
                        reference: type.shape.type,
                        fullyQualified: true
                    })
                ];
            default:
                assertNever(type.shape);
        }
    }

    // private generateInnerUnionClassSnippet({
    //     exampleUnion,
    //     innerValue
    // }: {
    //     exampleUnion: ExampleUnionType;
    //     innerValue: ruby.AstNode;
    // }): ruby.AstNode {
    //     return ruby.instantiateClass({
    //         classReference: this.getUnionTypeClassReferenceByTypeName(
    //             exampleUnion.singleUnionType.wireDiscriminantValue.name.pascalCase.safeName
    //         ),
    //         arguments_: [innerValue]
    //     });
    // }

    // private generateInnerValueSnippet({
    //     unionType,
    //     parseDatetimes
    // }: {
    //     unionType: FernIr.ExampleSingleUnionType;
    //     parseDatetimes: boolean;
    // }): ruby.AstNode {
    //     switch (unionType.shape.type) {
    //         case "samePropertiesAsObject": {
    //             const typeDeclaration = this.context.getTypeDeclarationOrThrow(unionType.shape.typeId);
    //             const objectGenerator = new ObjectGenerator(
    //                 this.context,
    //                 typeDeclaration,
    //                 typeDeclaration.shape as FernIr.ObjectTypeDeclaration
    //             );
    //             return objectGenerator.doGenerateSnippet({ exampleObject: unionType.shape.object, parseDatetimes });
    //         }
    //         case "singleProperty":
    //             return this.exampleGenerator.getSnippetForTypeReference({
    //                 exampleTypeReference: unionType.shape,
    //                 parseDatetimes
    //             });
    //         case "noProperties":
    //             // no params into inner union class
    //             return ruby.codeblock("");
    //         default:
    //             assertNever(unionType.shape);
    //     }
    // }
    // public shouldGenerateSnippet(): boolean {
    //     if (this.unionDeclaration.baseProperties.length > 0) {
    //         // example union types don't come with base properties,
    //         // so there's no way to generate snippets for them
    //         return false;
    //     }
    //     return true;
    // }

    // public doGenerateSnippet({
    //     exampleUnion,
    //     parseDatetimes
    // }: {
    //     exampleUnion: ExampleUnionType;
    //     parseDatetimes: boolean;
    // }): ruby.CodeBlock {
    //     if (this.shouldGenerateSnippet() === false) {
    //         this.context.logger.warn(
    //             `Generating snippet for union type ${this.classReference.name} but it has base properties, which is not supported.`
    //         );
    //     }
    //     const innerValue = this.generateInnerValueSnippet({ unionType: exampleUnion.singleUnionType, parseDatetimes });
    //     const innerObjectInstantiation = this.generateInnerUnionClassSnippet({ exampleUnion, innerValue });
    //     const instantiateClass = ruby.instantiateClass({
    //         classReference: this.classReference,
    //         arguments_: [innerObjectInstantiation]
    //     });
    //     return ruby.codeblock((writer) => writer.writeNode(instantiateClass));
    // }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId);
    }

    private getFilename(): string {
        return `${this.typeDeclaration.name.name.snakeCase.safeName}.rb`;
    }
}
