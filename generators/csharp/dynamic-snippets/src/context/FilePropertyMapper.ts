import { assertNever } from "@fern-api/core-utils";
import { ast, is, WithGeneration } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export interface FilePropertyInfo {
    fileFields: ast.ConstructorField[];
    bodyPropertyFields: ast.ConstructorField[];
}

export class FilePropertyMapper extends WithGeneration {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        super(context.generation);
        this.context = context;
    }

    public getFilePropertyInfo({
        body,
        value
    }: {
        body: FernIr.dynamic.FileUploadRequestBody;
        value: unknown;
    }): FilePropertyInfo {
        const result: FilePropertyInfo = {
            fileFields: [],
            bodyPropertyFields: []
        };
        const record = this.context.getRecord(value) ?? {};
        for (const property of body.properties) {
            switch (property.type) {
                case "file":
                    // if we don't have a record, we can fake some data for it.
                    if (is.Record.missingKey(record, property.wireValue)) {
                        record[property.wireValue] = "[bytes]";
                    }
                    result.fileFields.push({
                        name: this.context.getPropertyName(property.name),
                        value: this.getSingleFileProperty({ property, record })
                    });
                    break;
                case "fileArray":
                    // if we don't have a record, we can fake some data for it.
                    if (is.Record.missingKey(record, property.wireValue)) {
                        record[property.wireValue] = ["[bytes]"];
                    }
                    result.fileFields.push({
                        name: this.context.getPropertyName(property.name),
                        value: this.getArrayFileProperty({ property, record })
                    });
                    break;
                case "bodyProperty":
                    // if we don't have a record, we can try fake some data for it.
                    if (is.Record.missingKey(record, property.name.wireValue)) {
                        switch (property.typeReference.type) {
                            case "optional": {
                                // ignore missing optional values
                                break;
                            }
                            case "primitive": {
                                // for primitives, we can return a sample value.
                                switch (property.typeReference.value.toLowerCase()) {
                                    case "integer": {
                                        record[property.name.wireValue] = 123;
                                        break;
                                    }
                                    case "string": {
                                        record[property.name.wireValue] = "[string]";
                                        break;
                                    }
                                    case "boolean": {
                                        record[property.name.wireValue] = true;
                                        break;
                                    }
                                    case "double": {
                                        record[property.name.wireValue] = 123.456;
                                        break;
                                    }
                                    case "float": {
                                        record[property.name.wireValue] = 123.456;
                                        break;
                                    }
                                    case "long": {
                                        record[property.name.wireValue] = 123456789;
                                        break;
                                    }
                                    case "uint": {
                                        record[property.name.wireValue] = 123;
                                        break;
                                    }
                                    case "uint64": {
                                        record[property.name.wireValue] = 12345;
                                        break;
                                    }
                                    case "date": {
                                        record[property.name.wireValue] = new Date(2021, 1, 1);
                                        break;
                                    }
                                    case "datetime": {
                                        record[property.name.wireValue] = new Date(2021, 1, 1, 12, 0, 0);
                                        break;
                                    }
                                    case "uuid": {
                                        record[property.name.wireValue] = "123e4567-e89b-12d3-a456-426614174000";
                                        break;
                                    }
                                    case "base64": {
                                        record[property.name.wireValue] = "SGVsbG8gd29ybGQh";
                                        break;
                                    }
                                    case "biginteger": {
                                        record[property.name.wireValue] = "12345678901234567890";
                                        break;
                                    }
                                }
                                break;
                            }

                            default: {
                                // todo: optionally synthesize a value for a other types in the future
                                break;
                            }
                        }
                    }
                    result.bodyPropertyFields.push({
                        name: this.context.getPropertyName(property.name.name),
                        value: this.getBodyProperty({ property, record })
                    });
                    break;
                default:
                    assertNever(property);
            }
        }
        return result;
    }

    private getSingleFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.File_;
        record: Record<string, unknown>;
    }): ast.Literal {
        const fileValue = this.context.getSingleFileValue({ property, record });
        if (fileValue == null) {
            return this.csharp.Literal.nop();
        }
        return this.context.getFileParameterForString(fileValue);
    }

    private getArrayFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.FileArray;
        record: Record<string, unknown>;
    }): ast.Literal {
        const fileValues = this.context.getFileArrayValues({ property, record });
        if (fileValues == null) {
            return this.csharp.Literal.nop();
        }
        return this.csharp.Literal.list({
            valueType: this.Types.FileParameter,
            values: fileValues.map((value) => this.context.getFileParameterForString(value))
        });
    }

    private getBodyProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.NamedParameter;
        record: Record<string, unknown>;
    }): ast.Literal {
        const bodyPropertyValue = record[property.name.wireValue];
        if (bodyPropertyValue == null) {
            return this.csharp.Literal.nop();
        }
        return this.context.dynamicLiteralMapper.convert({
            typeReference: property.typeReference,
            value: bodyPropertyValue
        });
    }
}
