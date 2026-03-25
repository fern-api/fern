import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, PUBLIC, rust } from "@fern-api/rust-codegen";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export class EnumGenerator {
    private readonly typeDeclaration: FernIr.TypeDeclaration;
    private readonly enumTypeDeclaration: FernIr.EnumTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(
        typeDeclaration: FernIr.TypeDeclaration,
        enumTypeDeclaration: FernIr.EnumTypeDeclaration,
        context: ModelGeneratorContext
    ) {
        this.typeDeclaration = typeDeclaration;
        this.enumTypeDeclaration = enumTypeDeclaration;
        this.context = context;
    }

    private isForwardCompatible(): boolean {
        // Single-variant enums are type discriminants used in #[serde(untagged)] unions.
        // Making them forward-compatible would cause the first variant to greedily match
        // every message, breaking dispatch. Only multi-variant enums get __Unknown.
        if (this.enumTypeDeclaration.values.length <= 1) {
            return false;
        }
        // All other enums are forward-compatible by default in Rust. This matches C# and
        // TypeScript behavior where unknown enum values never cause deserialization failures.
        const irFlag = (this.enumTypeDeclaration as unknown as Record<string, unknown>).forwardCompatible;
        return irFlag !== false;
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

        if (this.isForwardCompatible()) {
            // Write custom Serialize/Deserialize implementations
            this.writeSerializeImplementation(writer);
            writer.newLine();
            this.writeDeserializeImplementation(writer);
            writer.newLine();
        }

        // Write Display implementation
        this.writeDisplayImplementation(writer);

        return writer.toString();
    }

    private generateEnumForTypeDeclaration(): rust.Enum {
        const variants = this.enumTypeDeclaration.values.map((enumValue) => this.generateEnumVariant(enumValue));

        if (this.isForwardCompatible()) {
            variants.push(
                rust.enumVariant({
                    name: "__Unknown",
                    data: [rust.Type.string()],
                    docs: rust.docComment({
                        summary:
                            "This variant is used for forward compatibility.\n" +
                            "If the server sends a value not recognized by the current SDK version,\n" +
                            "it will be captured here with the raw string value."
                    })
                })
            );
        }

        return rust.enum_({
            name: this.context.getUniqueTypeNameForDeclaration(this.typeDeclaration),
            visibility: PUBLIC,
            attributes: this.generateEnumAttributes(),
            variants,
            docs: this.typeDeclaration.docs
                ? rust.docComment({
                      summary: this.typeDeclaration.docs
                  })
                : undefined
        });
    }

    private generateEnumAttributes(): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];

        if (this.isForwardCompatible()) {
            attributes.push(Attribute.nonExhaustive());
            // No Serialize/Deserialize derives; we provide custom impls
            attributes.push(Attribute.derive(["Debug", "Clone", "PartialEq", "Eq", "Hash"]));
        } else {
            attributes.push(Attribute.derive(["Debug", "Clone", "Serialize", "Deserialize", "PartialEq", "Eq", "Hash"]));
        }

        return attributes;
    }

    private generateEnumVariant(enumValue: FernIr.EnumTypeDeclaration["values"][0]): rust.EnumVariant {
        const variantAttributes: rust.Attribute[] = [];

        // Only add serde rename for non-forward-compatible enums (forward-compatible enums use custom serde impls)
        if (!this.isForwardCompatible() && enumValue.name.name.pascalCase.unsafeName !== enumValue.name.wireValue) {
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

    private writeSerializeImplementation(writer: rust.Writer): void {
        const enumName = this.context.getUniqueTypeNameForDeclaration(this.typeDeclaration);

        writer.writeLine(`impl Serialize for ${enumName} {`);
        writer.indent();
        writer.writeLine("fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {");
        writer.indent();
        writer.writeLine("match self {");
        writer.indent();

        this.enumTypeDeclaration.values.forEach((enumValue) => {
            const variantName = enumValue.name.name.pascalCase.unsafeName;
            const wireValue = enumValue.name.wireValue;
            writer.writeLine(`Self::${variantName} => serializer.serialize_str(${JSON.stringify(wireValue)}),`);
        });

        writer.writeLine("Self::__Unknown(val) => serializer.serialize_str(val),");

        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
    }

    private writeDeserializeImplementation(writer: rust.Writer): void {
        const enumName = this.context.getUniqueTypeNameForDeclaration(this.typeDeclaration);

        writer.writeLine(`impl<'de> Deserialize<'de> for ${enumName} {`);
        writer.indent();
        writer.writeLine(
            "fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {"
        );
        writer.indent();
        writer.writeLine("let value = String::deserialize(deserializer)?;");
        writer.writeLine("match value.as_str() {");
        writer.indent();

        this.enumTypeDeclaration.values.forEach((enumValue) => {
            const variantName = enumValue.name.name.pascalCase.unsafeName;
            const wireValue = enumValue.name.wireValue;
            writer.writeLine(`${JSON.stringify(wireValue)} => Ok(Self::${variantName}),`);
        });

        writer.writeLine("_ => Ok(Self::__Unknown(value)),");

        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
    }

    private writeDisplayImplementation(writer: rust.Writer): void {
        const enumName = this.context.getUniqueTypeNameForDeclaration(this.typeDeclaration);

        writer.writeLine(`impl fmt::Display for ${enumName} {`);
        writer.indent();
        writer.writeLine("fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {");
        writer.indent();

        if (this.isForwardCompatible()) {
            writer.writeLine("match self {");
            writer.indent();

            this.enumTypeDeclaration.values.forEach((enumValue) => {
                const variantName = enumValue.name.name.pascalCase.unsafeName;
                const wireValue = enumValue.name.wireValue;
                writer.writeLine(`Self::${variantName} => write!(f, ${JSON.stringify(wireValue)}),`);
            });

            writer.writeLine("Self::__Unknown(val) => write!(f, \"{}\", val),");

            writer.dedent();
            writer.writeLine("}");
        } else {
            writer.writeLine("let s = match self {");
            writer.indent();

            this.enumTypeDeclaration.values.forEach((enumValue) => {
                const variantName = enumValue.name.name.pascalCase.unsafeName;
                const wireValue = enumValue.name.wireValue;
                writer.writeLine(`Self::${variantName} => ${JSON.stringify(wireValue)},`);
            });

            writer.dedent();
            writer.writeLine("};");
            writer.writeLine('write!(f, "{}", s)');
        }

        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
    }
}
