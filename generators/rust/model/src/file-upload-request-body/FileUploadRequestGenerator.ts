import { FernIr } from "@fern-fern/ir-sdk";
import {
    Attribute,
    CodeBlock,
    ImplBlock,
    Method,
    PUBLIC,
    Reference,
    rust,
    Statement,
    Type
} from "@fern-api/rust-codegen";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { collectBuilderFieldsFromProperties, writeBuilderCode } from "../utils/builderUtils.js";
import { isOptionalType } from "../utils/primitiveTypeUtils.js";
import {
    canDeriveHashAndEq,
    canDerivePartialEq,
    generateFieldAttributes,
    generateFieldType
} from "../utils/structUtils.js";

export declare namespace FileUploadRequestGenerator {
    interface Args {
        name: string;
        properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[];
        fileProperties: Array<{ name: string; isArray: boolean; isOptional: boolean }>;
        bodyProperties: FernIr.InlinedRequestBodyProperty[];
        docsContent?: string;
        context: ModelGeneratorContext;
        /** Field names that are query parameters and should be excluded from serialization */
        queryParamFieldNames?: Set<string>;
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
    private readonly properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[];
    private readonly fileProperties: Array<{ name: string; isArray: boolean; isOptional: boolean }>;
    private readonly bodyProperties: FernIr.InlinedRequestBodyProperty[];
    private readonly docsContent?: string;
    private readonly context: ModelGeneratorContext;
    private readonly queryParamFieldNames: Set<string>;

    public constructor({
        name,
        properties,
        fileProperties,
        bodyProperties,
        docsContent,
        context,
        queryParamFieldNames
    }: FileUploadRequestGenerator.Args) {
        this.name = name;
        this.properties = properties;
        this.fileProperties = fileProperties;
        this.bodyProperties = bodyProperties;
        this.docsContent = docsContent;
        this.context = context;
        this.queryParamFieldNames = queryParamFieldNames ?? new Set();
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

        // Generate builder code
        const fields = collectBuilderFieldsFromProperties(this.properties, this.context);
        writeBuilderCode(writer, this.name, fields);

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
            returnType: Type.reference(new Reference({ name: "reqwest::multipart::Form", module: undefined })),
            isStatic: false,
            body
        });
    }

    private generateToMultipartBody(): CodeBlock {
        const statements: string[] = [];

        // Initialize reqwest multipart form
        statements.push("let mut form = reqwest::multipart::Form::new();");
        statements.push("");

        // Add file fields
        for (const fileProp of this.fileProperties) {
            const fieldName = this.getFieldName(fileProp.name);

            if (fileProp.isOptional) {
                if (fileProp.isArray) {
                    // Optional array of files
                    statements.push(`if let Some(ref files) = self.${fieldName} {`);
                    statements.push(`    for file_data in files {`);
                    statements.push(`        form = form.part(`);
                    statements.push(`            "${fileProp.name}",`);
                    statements.push(`            reqwest::multipart::Part::bytes(file_data.clone())`);
                    statements.push(`                .file_name("${fileProp.name}")`);
                    statements.push(`                .mime_str("application/octet-stream").unwrap()`);
                    statements.push(`        );`);
                    statements.push(`    }`);
                    statements.push(`}`);
                } else {
                    // Optional single file
                    statements.push(`if let Some(ref file_data) = self.${fieldName} {`);
                    statements.push(`    form = form.part(`);
                    statements.push(`        "${fileProp.name}",`);
                    statements.push(`        reqwest::multipart::Part::bytes(file_data.clone())`);
                    statements.push(`            .file_name("${fileProp.name}")`);
                    statements.push(`            .mime_str("application/octet-stream").unwrap()`);
                    statements.push(`    );`);
                    statements.push(`}`);
                }
            } else {
                if (fileProp.isArray) {
                    // Required array of files
                    statements.push(`for file_data in &self.${fieldName} {`);
                    statements.push(`    form = form.part(`);
                    statements.push(`        "${fileProp.name}",`);
                    statements.push(`        reqwest::multipart::Part::bytes(file_data.clone())`);
                    statements.push(`            .file_name("${fileProp.name}")`);
                    statements.push(`            .mime_str("application/octet-stream").unwrap()`);
                    statements.push(`    );`);
                    statements.push(`}`);
                } else {
                    // Required single file
                    statements.push(`form = form.part(`);
                    statements.push(`    "${fileProp.name}",`);
                    statements.push(`    reqwest::multipart::Part::bytes(self.${fieldName}.clone())`);
                    statements.push(`        .file_name("${fileProp.name}")`);
                    statements.push(`        .mime_str("application/octet-stream").unwrap()`);
                    statements.push(`);`);
                }
            }
            statements.push("");
        }

        // Add body properties as text fields
        for (const bodyProp of this.bodyProperties) {
            const propName = bodyProp.name.name.originalName;
            const fieldName = this.getFieldName(propName);
            const isOptional = isOptionalType(bodyProp.valueType);

            if (isOptional) {
                statements.push(`if let Some(ref value) = self.${fieldName} {`);
                statements.push(`    if let Ok(json_str) = serde_json::to_string(value) {`);
                statements.push(`        form = form.text("${propName}", json_str);`);
                statements.push(`    }`);
                statements.push(`}`);
            } else {
                statements.push(`if let Ok(json_str) = serde_json::to_string(&self.${fieldName}) {`);
                statements.push(`    form = form.text("${propName}", json_str);`);
                statements.push(`}`);
            }
            statements.push("");
        }

        statements.push("form");

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

    private generateRustFieldForProperty(property: FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty): rust.Field {
        const fieldName = this.context.escapeRustKeyword(property.name.name.snakeCase.unsafeName);
        const fieldType = generateFieldType(property, this.context);
        const skipSerialization = this.queryParamFieldNames.has(fieldName);
        const attributes = generateFieldAttributes(property, this.context, { skipSerialization });

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
