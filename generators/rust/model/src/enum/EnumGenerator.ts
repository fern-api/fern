import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, Attribute, PUBLIC } from "@fern-api/rust-codegen";
import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

export class EnumGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly enumTypeDeclaration: EnumTypeDeclaration;

    public constructor(typeDeclaration: TypeDeclaration, enumTypeDeclaration: EnumTypeDeclaration) {
        this.typeDeclaration = typeDeclaration;
        this.enumTypeDeclaration = enumTypeDeclaration;
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
        return this.typeDeclaration.name.name.snakeCase.unsafeName + ".rs";
    }

    private getFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of("src");
    }

    private generateFileContents(rustEnum: rust.Enum): string {
        const writer = rust.writer();

        // Add use statements
        this.writeUseStatements(writer);
        writer.newLine();

        // Write the enum
        rustEnum.write(writer);

        return writer.toString();
    }

    private writeUseStatements(writer: rust.Writer): void {
        writer.writeLine("use serde::{Deserialize, Serialize};");
    }

    private generateEnumForTypeDeclaration(): rust.Enum {
        return rust.enum_({
            name: this.typeDeclaration.name.name.pascalCase.unsafeName,
            visibility: PUBLIC,
            attributes: this.generateEnumAttributes(),
            variants: this.enumTypeDeclaration.values.map((enumValue) => this.generateEnumVariant(enumValue))
        });
    }

    private generateEnumAttributes(): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];

        // Always add basic derives
        const derives = ["Debug", "Clone", "Serialize", "Deserialize", "PartialEq"];
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
            attributes: variantAttributes.length > 0 ? variantAttributes : undefined
        });
    }

    private escapeRustKeyword(name: string): string {
        const rustKeywords = new Set([
            "as",
            "break",
            "const",
            "continue",
            "crate",
            "else",
            "enum",
            "extern",
            "false",
            "fn",
            "for",
            "if",
            "impl",
            "in",
            "let",
            "loop",
            "match",
            "mod",
            "move",
            "mut",
            "pub",
            "ref",
            "return",
            "self",
            "Self",
            "static",
            "struct",
            "super",
            "trait",
            "true",
            "type",
            "unsafe",
            "use",
            "where",
            "while"
        ]);

        return rustKeywords.has(name) ? `r#${name}` : name;
    }
}
