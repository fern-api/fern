import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { RubyFile, FileGenerator } from "@fern-api/ruby-base";
import { ruby } from "@fern-api/ruby-ast";
import { NameAndWireValue, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { generateFields } from "../generateFields";

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
        // Extract properties from the object declaration
        const properties = this.objectDeclaration.properties || [];
        
        // Generate field declarations using the helper function
        const statements = generateFields({
            properties,
            context: this.context
        });
    
        // Get module names from IR data or config
        const fernFilepath = this.typeDeclaration.name.fernFilepath;
        const clientModuleName = this.context.customConfig.clientModuleName || 
            fernFilepath.allParts[0]?.pascalCase.safeName || "Api";
        const typesModuleName = this.context.customConfig.typesModuleName || "Types";

        // Create the class with hardcoded superclass
        const classNode = ruby.class_({
            name: this.typeDeclaration.name.name.pascalCase.safeName,
            superclass: ruby.classReference({ 
                name: "Model", 
                modules: ["Internal", "Types"] 
            }),
            docstring: this.typeDeclaration.docs ?? undefined,
            statements: statements
        });
    
        // Create the Types module
        const typesModule = ruby.module({
            name: typesModuleName,
            statements: [classNode]
        });
    
        // Create the client module
        const clientModule = ruby.module({
            name: clientModuleName,
            statements: [typesModule]
        });
    
        // Create a comment node for frozen_string_literal
        const frozenComment = ruby.comment({ docs: "frozen_string_literal: true" });

        // Combine comment and module
        const fileContent = ruby.codeblock((writer) => {
            frozenComment.write(writer);
            writer.newLine();
            clientModule.write(writer);
        });
    
        return new RubyFile({
            node: fileContent,
            directory: this.getFilepath(),
            filename: `${this.typeDeclaration.name.name.snakeCase.safeName}.rb`,
            customConfig: this.context.customConfig
        });
    }
}