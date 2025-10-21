import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, PUBLIC, rust } from "@fern-api/rust-codegen";
import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class EnumGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly enumTypeDeclaration: EnumTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(
        typeDeclaration: TypeDeclaration,
        enumTypeDeclaration: EnumTypeDeclaration,
        context: ModelGeneratorContext
    ) {
        this.typeDeclaration = typeDeclaration;
        this.enumTypeDeclaration = enumTypeDeclaration;
        this.context = context;
    }

    public generate(): RustFile {
        const rustEnum = this.generateEnumForTypeDeclaration();
        const fileContents = this.generateFileContents(rustEnum);
        return new RustFile({
            filename: this.getFilename(),
            directory: this.getFileDirectory(),
            fileContents
        });
    }

    private getFilename(): string {
        return this.context.getUniqueFilenameForType(this.typeDeclaration);
    }

    private getFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of("src");
    }

    private generateFileContents(rustEnum: rust.Enum): string {
        const writer = rust.writer();

        // Add use statements
        writer.writeLine("pub use crate::prelude::*;");
        writer.newLine();

        // Write the enum
        rustEnum.write(writer);
        writer.newLine();

        // Write Display implementation
        this.writeDisplayImplementation(writer);

        return writer.toString();
    }

    private generateEnumForTypeDeclaration(): rust.Enum {
        return rust.enum_({
            name: this.context.getUniqueTypeNameForDeclaration(this.typeDeclaration),
            visibility: PUBLIC,
            attributes: this.generateEnumAttributes(),
            variants: this.enumTypeDeclaration.values.map((enumValue) => this.generateEnumVariant(enumValue)),
            docs: this.typeDeclaration.docs
                ? rust.docComment({
                      summary: this.typeDeclaration.docs
                  })
                : undefined
        });
    }

    private generateEnumAttributes(): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];

        // Always add basic derives including Hash and Eq for maximum compatibility
        // Hash and Eq are needed when enums are used as HashMap keys
        const derives = ["Debug", "Clone", "Serialize", "Deserialize", "PartialEq", "Eq", "Hash"];
        attributes.push(Attribute.derive(derives));

        return attributes;
    }

    private generateEnumVariant(enumValue: EnumTypeDeclaration["values"][0]): rust.EnumVariant {
        const variantAttributes: rust.Attribute[] = [];

        // Add serde rename if the variant name differs from wire value
        if (enumValue.name.name.pascalCase.unsafeName !== enumValue.name.wireValue) {
            variantAttributes.push(Attribute.serde.rename(enumValue.name.wireValue));
        }

        return rust.enumVariant({
            name: enumValue.name.name.pascalCase.unsafeName,
            attributes: variantAttributes.length > 0 ? variantAttributes : undefined,
            docs: enumValue.docs
                ? rust.docComment({
                      summary: enumValue.docs
                  })
                : undefined
        });
    }

    private writeDisplayImplementation(writer: rust.Writer): void {
        const enumName = this.context.getUniqueTypeNameForDeclaration(this.typeDeclaration);

        writer.writeLine(`impl fmt::Display for ${enumName} {`);
        writer.indent();
        writer.writeLine("fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {");
        writer.indent();
        writer.writeLine("let s = match self {");
        writer.indent();

        // Generate match arms for each enum variant
        this.enumTypeDeclaration.values.forEach((enumValue) => {
            const variantName = enumValue.name.name.pascalCase.unsafeName;
            const wireValue = enumValue.name.wireValue;
            // Use JSON.stringify to properly escape special characters in string literals
            writer.writeLine(`Self::${variantName} => ${JSON.stringify(wireValue)},`);
        });

        writer.dedent();
        writer.writeLine("};");
        writer.writeLine('write!(f, "{}", s)');
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
    }
}
