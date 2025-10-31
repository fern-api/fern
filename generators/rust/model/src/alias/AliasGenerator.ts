import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, PUBLIC, rust } from "@fern-api/rust-codegen";
import { AliasTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { generateRustTypeForTypeReference } from "../converters";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { typeSupportsHashAndEq } from "../utils/primitiveTypeUtils";

export class AliasGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly aliasTypeDeclaration: AliasTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(
        typeDeclaration: TypeDeclaration,
        aliasTypeDeclaration: AliasTypeDeclaration,
        context: ModelGeneratorContext
    ) {
        this.typeDeclaration = typeDeclaration;
        this.aliasTypeDeclaration = aliasTypeDeclaration;
        this.context = context;
    }

    public generate(): RustFile {
        const rustNewtype = this.generateNewtypeForTypeDeclaration();
        const fileContents = this.generateFileContents(rustNewtype);
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

    private generateFileContents(rustNewtype: rust.NewtypeStruct): string {
        const writer = rust.writer();

        // Add use statements
        writer.writeLine("pub use crate::prelude::*;");
        writer.newLine();

        // Write the newtype struct
        rustNewtype.write(writer);

        return writer.toString();
    }

    private generateNewtypeForTypeDeclaration(): rust.NewtypeStruct {
        return rust.newtypeStruct({
            name: this.context.getUniqueTypeNameForDeclaration(this.typeDeclaration),
            innerType: generateRustTypeForTypeReference(this.aliasTypeDeclaration.aliasOf, this.context),
            visibility: PUBLIC,
            innerVisibility: PUBLIC,
            attributes: this.generateNewtypeAttributes()
        });
    }

    private generateNewtypeAttributes(): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];

        // Always add basic derives
        const derives = ["Debug", "Clone", "Serialize", "Deserialize", "PartialEq"];

        // Only add Eq and Hash if the aliased type supports them
        if (this.canDeriveHashAndEq()) {
            derives.push("Eq", "Hash");
        }

        attributes.push(Attribute.derive(derives));

        // DateTime aliases will use default RFC 3339 string serialization
        // No special serde handling needed for datetime aliases

        return attributes;
    }

    private canDeriveHashAndEq(): boolean {
        // Check if the aliased type can support Hash and Eq derives
        return typeSupportsHashAndEq(this.aliasTypeDeclaration.aliasOf, this.context);
    }
}
