import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { RubyFile, FileGenerator } from "@fern-api/ruby-base";
import { ruby } from "@fern-api/ruby-ast";
import { NameAndWireValue, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";



export interface GeneratorContextLike {
    customConfig: unknown;
}

export class ObjectGenerator extends FileGenerator<RubyFile, ModelCustomConfigSchema, ModelGeneratorContext> {

    private readonly typeDeclaration: TypeDeclaration;
    private readonly objectDeclaration: ObjectTypeDeclaration;

    public constructor(context: ModelGeneratorContext, typeDeclaration: TypeDeclaration, objectDeclaration: ObjectTypeDeclaration) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.objectDeclaration = objectDeclaration;
    }

    protected getFilepath(): RelativeFilePath {
        return RelativeFilePath.of("lib");
    }

    public doGenerate(): RubyFile {
        return new RubyFile({
            node: ruby.class_({
                name: this.typeDeclaration.name.name.pascalCase.safeName,
                docstring: this.typeDeclaration.docs ?? undefined,
            }),
            directory: this.getFilepath(),
            filename: `${this.typeDeclaration.name.name.pascalCase.safeName}.rb`,
            customConfig: this.context.customConfig
        });
    }
}

// export class ObjectGenerator {
//     private readonly context: GeneratorContextLike;
//     private readonly typeDeclaration: TypeDeclaration;
//     private readonly objectDeclaration: ObjectTypeDeclaration;

//     public constructor(
//         context: GeneratorContextLike,
//         typeDeclaration: TypeDeclaration,
//         objectDeclaration: ObjectTypeDeclaration
//     ) {
//         this.context = context;
//         this.typeDeclaration = typeDeclaration;
//         this.objectDeclaration = objectDeclaration;
//     }

//     public generate(): RubyFile {
//         const className = this.typeDeclaration.name.name.pascalCase.safeName;

//         const properties = [
//             ...this.objectDeclaration.properties,
//             ...(this.objectDeclaration.extendedProperties ?? [])
//         ];

//         const attrAccessor = ruby.codeblock((writer) => {
//             if (properties.length > 0) {
//                 writer.write(
//                     `attr_accessor ${properties.map((p) => `:${this.getPropertyName(p.name)}`).join(", ")}`
//                 );
//             }
//         });

//         const classNode = ruby.class_({
//             name: className,
//             docstring: this.typeDeclaration.docs ?? undefined,
//             statements: properties.length > 0 ? [attrAccessor] : []
//         });

//         return new RubyFile({
//             node: classNode,
//             directory: RelativeFilePath.of("lib"),
//             filename: `${className}.rb`,
//             customConfig: this.context.customConfig
//         });
//     }

//     private getPropertyName(propName: NameAndWireValue["name"]): string {
//         return propName.snakeCase.safeName;
//     }
