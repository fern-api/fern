import {
    Attribute,
    ImplBlock,
    Method,
    PUBLIC,
    rust,
    Type,
    CodeBlock,
    Statement,
    Reference
} from "@fern-api/rust-codegen";
import { InlinedRequestBodyProperty, ObjectProperty } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { isOptionalType } from "../utils/primitiveTypeUtils";
import {
    canDeriveHashAndEq,
    canDerivePartialEq,
    generateFieldAttributes,
    generateFieldType
} from "../utils/structUtils";

export declare namespace FileUploadRequestGenerator {
    interface Args {
        name: string;
        properties: (ObjectProperty | InlinedRequestBodyProperty)[];
        fileProperties: Array<{ name: string; isArray: boolean; isOptional: boolean }>;
        bodyProperties: InlinedRequestBodyProperty[];
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

/**
 * Generates a file upload request struct with multipart/form-data conversion capability.
 *
 * This generator creates:
 * 1. A struct with FormFile fields for file uploads and regular fields for body properties
 * 2. An impl block with a `to_multipart()` method that converts the struct to MultipartFormData
 */
export class FileUploadRequestGenerator {
    private readonly name: string;
    private readonly properties: (ObjectProperty | InlinedRequestBodyProperty)[];
    private readonly fileProperties: Array<{ name: string; isArray: boolean; isOptional: boolean }>;
    private readonly bodyProperties: InlinedRequestBodyProperty[];
    private readonly docsContent?: string;
    private readonly context: ModelGeneratorContext;

    public constructor({
        name,
        properties,
        fileProperties,
        bodyProperties,
        docsContent,
        context
    }: FileUploadRequestGenerator.Args) {
        this.name = name;
        this.properties = properties;
        this.fileProperties = fileProperties;
        this.bodyProperties = bodyProperties;
        this.docsContent = docsContent;
        this.context = context;
    }

    public generateFileContents(): string {
        const writer = rust.writer();

        // Add prelude import
        writer.writeLine("pub use crate::prelude::*;");
        writer.newLine();

        // Generate struct
        const struct = this.generateStruct();
        struct.write(writer);
        writer.newLine();

        // Generate impl block
        const implBlock = this.generateImplBlock();
        implBlock.write(writer);

        return writer.toString();
    }

    private generateStruct(): rust.Struct {
        const fields: rust.Field[] = [];

        // Generate fields for all properties (files and body properties)
        fields.push(...this.properties.map((property) => this.generateRustFieldForProperty(property)));

        return rust.struct({
            name: this.name,
            visibility: PUBLIC,
            attributes: this.generateStructAttributes(),
            fields
        });
    }

    private generateImplBlock(): ImplBlock {
        const toMultipartMethod = this.generateToMultipartMethod();

        return new ImplBlock({
            targetType: Type.reference(new Reference({ name: this.name, module: undefined })),
            methods: [toMultipartMethod]
        });
    }

    private generateToMultipartMethod(): Method {
        const body = this.generateToMultipartBody();

        return new Method({
            name: "to_multipart",
            visibility: PUBLIC,
            parameters: [
                {
                    name: "self",
                    parameterType: Type.reference(new Reference({ name: "&self", module: undefined })),
                    isSelf: true
                }
            ],
            returnType: Type.reference(new Reference({ name: "MultipartFormData", module: undefined })),
            isStatic: false,
            body
        });
    }

    private generateToMultipartBody(): CodeBlock {
        const statements: string[] = [];

        // Initialize multipart
        statements.push("let mut multipart = MultipartFormData::new();");
        statements.push("");

        // Add file fields
        for (const fileProp of this.fileProperties) {
            const fieldName = this.getFieldName(fileProp.name);

            if (fileProp.isOptional) {
                if (fileProp.isArray) {
                    // Optional array of files
                    statements.push(`if let Some(ref files) = self.${fieldName} {`);
                    statements.push(
                        `    multipart.add_file_array("${fileProp.name}".to_string(), files.iter().map(|data| {`
                    );
                    statements.push(
                        `        FormFile::new(data.clone()).with_filename("${fileProp.name}".to_string()).with_content_type("application/octet-stream".to_string())`
                    );
                    statements.push(`    }).collect());`);
                    statements.push(`}`);
                } else {
                    // Optional single file
                    statements.push(`if let Some(ref file_data) = self.${fieldName} {`);
                    statements.push(
                        `    multipart.add_file("${fileProp.name}".to_string(), FormFile::new(file_data.clone()).with_filename("${fileProp.name}".to_string()).with_content_type("application/octet-stream".to_string()));`
                    );
                    statements.push(`}`);
                }
            } else {
                if (fileProp.isArray) {
                    // Required array of files
                    statements.push(
                        `multipart.add_file_array("${fileProp.name}".to_string(), self.${fieldName}.iter().map(|data| {`
                    );
                    statements.push(
                        `    FormFile::new(data.clone()).with_filename("${fileProp.name}".to_string()).with_content_type("application/octet-stream".to_string())`
                    );
                    statements.push(`}).collect());`);
                } else {
                    // Required single file
                    statements.push(
                        `multipart.add_file("${fileProp.name}".to_string(), FormFile::new(self.${fieldName}.clone()).with_filename("${fileProp.name}".to_string()).with_content_type("application/octet-stream".to_string()));`
                    );
                }
            }
            statements.push("");
        }

        // Add body properties as JSON fields
        for (const bodyProp of this.bodyProperties) {
            const propName = bodyProp.name.name.originalName;
            const fieldName = this.getFieldName(propName);
            const isOptional = isOptionalType(bodyProp.valueType);

            if (isOptional) {
                statements.push(`if let Some(ref value) = self.${fieldName} {`);
                statements.push(`    if let Ok(json_str) = serde_json::to_string(value) {`);
                statements.push(`        multipart.add_field("${propName}".to_string(), json_str);`);
                statements.push(`    }`);
                statements.push(`}`);
            } else {
                statements.push(`if let Ok(json_str) = serde_json::to_string(&self.${fieldName}) {`);
                statements.push(`    multipart.add_field("${propName}".to_string(), json_str);`);
                statements.push(`}`);
            }
            statements.push("");
        }

        statements.push("multipart");

        // Create Statement array from raw strings
        const statementObjects = statements.map((s) => Statement.raw(s));

        return CodeBlock.fromStatements(statementObjects);
    }

    private generateStructAttributes(): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];

        // Build derives conditionally
        const derives: string[] = ["Debug", "Clone", "Serialize", "Deserialize"];

        // Default - only add if all properties are optional
        if (this.allPropertiesAreOptional()) {
            derives.push("Default");
        }

        // PartialEq - for equality comparisons
        if (this.needsPartialEq()) {
            derives.push("PartialEq");
        }

        // Only add Hash and Eq if all field types support them
        if (this.needsDeriveHashAndEq()) {
            derives.push("Eq", "Hash");
        }

        attributes.push(Attribute.derive(derives));

        return attributes;
    }

    private generateRustFieldForProperty(property: ObjectProperty | InlinedRequestBodyProperty): rust.Field {
        const fieldName = this.context.escapeRustKeyword(property.name.name.snakeCase.unsafeName);
        const fieldType = generateFieldType(property, this.context);
        const attributes = generateFieldAttributes(property);

        return rust.field({
            name: fieldName,
            type: fieldType,
            visibility: PUBLIC,
            attributes
        });
    }

    private getFieldName(name: string): string {
        // Convert to snake_case and escape Rust keywords if needed
        const snakeCaseName = name
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase()
            .replace(/^_/, "");
        return this.context.escapeRustKeyword(snakeCaseName);
    }

    private allPropertiesAreOptional(): boolean {
        return this.properties.every((property) => isOptionalType(property.valueType));
    }

    private needsPartialEq(): boolean {
        return canDerivePartialEq(this.properties, this.context);
    }

    private needsDeriveHashAndEq(): boolean {
        return canDeriveHashAndEq(this.properties, this.context);
    }
}
