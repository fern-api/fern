import {
    DescriptorProto,
    EnumDescriptorProto,
    FieldDescriptorProto,
    FieldDescriptorProto_Label,
    FieldDescriptorProto_Type
} from "@bufbuild/protobuf/wkt";
import { AbstractConverter } from "@fern-api/v2-importer-commons";
import { ProtofileConverterContext } from "../ProtofileConverterContext";

export declare namespace ExampleConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        message: DescriptorProto;
        depth?: number;
        seenMessages?: Set<string>;
    }

    export interface Output {
        isValid: boolean;
        coerced: boolean;
        validExample: unknown;
        errors: string[];
    }
}

export class ExampleConverter extends AbstractConverter<ProtofileConverterContext, ExampleConverter.Output> {
    private readonly MAX_DEPTH = 12;
    private readonly EXAMPLE_STRING = "example"; 
    private readonly EXAMPLE_NUMBER = 42;
    private readonly EXAMPLE_BOOL = true;
    private readonly EXAMPLE_BYTES = "bytes";
    private readonly EXAMPLE_EMAIL = "user@example.com";
    private readonly EXAMPLE_DATE = "2024-01-01";
    private readonly EXAMPLE_ID = "123e4567-e89b-12d3-a456-426614174000";

    private readonly message: DescriptorProto;
    private readonly depth: number;
    private readonly seenMessages: Set<string>;

    constructor({
        breadcrumbs,
        context,
        message,
        depth = 0,
        seenMessages = new Set()
    }: ExampleConverter.Args) {
        super({ context, breadcrumbs });
        this.message = message;
        this.depth = depth;
        this.seenMessages = seenMessages;
    }

    public convert(): ExampleConverter.Output {
        if (this.depth > this.MAX_DEPTH) {
            return {
                isValid: true,
                coerced: false,
                validExample: {},
                errors: []
            };
        }

        const messageName = this.message.name ?? "";
        if (this.seenMessages.has(messageName)) {
            return {
                isValid: true,
                coerced: false,
                validExample: {},
                errors: []
            };
        }

        const newSeenMessages = new Set(this.seenMessages);
        newSeenMessages.add(messageName);

        try {
            return this.convertMessage(newSeenMessages);
        } catch (error) {
            return {
                isValid: false,
                coerced: false,
                validExample: {},
                errors: [`Failed to convert message ${messageName}: ${error}`]
            };
        }
    }

    private convertMessage(seenMessages: Set<string>): ExampleConverter.Output {
        const resultsByFieldName = new Map<string, { field: FieldDescriptorProto; result: ExampleConverter.Output }>();
        const oneofChoices = new Map<number, FieldDescriptorProto>();

        // First pass: determine oneof choices (use first field in each oneof)
        for (const field of this.message.field) {
            if (field.oneofIndex != null && field.oneofIndex >= 0) {
                if (!oneofChoices.has(field.oneofIndex)) {
                    oneofChoices.set(field.oneofIndex, field);
                }
            }
        }

        // Second pass: convert fields
        for (const field of this.message.field) {
            const fieldName = field.name ?? "";
            if (!fieldName) continue;

            // Skip oneof fields that aren't chosen
            if (field.oneofIndex != null && field.oneofIndex >= 0) {
                const chosenField = oneofChoices.get(field.oneofIndex);
                if (chosenField !== field) {
                    continue;
                }
            }

            try {
                const fieldResult = this.convertField({
                    field,
                    seenMessages,
                    fieldName
                });
                resultsByFieldName.set(fieldName, { field, result: fieldResult });
            } catch (error) {
                resultsByFieldName.set(fieldName, {
                    field,
                    result: {
                        isValid: false,
                        coerced: false,
                        validExample: null,
                        errors: [`Error converting field ${fieldName}: ${error}`]
                    }
                });
            }
        }

        const allResults = Array.from(resultsByFieldName.values());
        const isValid = allResults.every(({ result }) => result.isValid);
        const allErrors = allResults.flatMap(({ result }) => result.errors);

        const validExample = Object.fromEntries(
            allResults
                .map(({ field, result }) => [field.name, result.validExample])
                .filter(([_, value]) => value !== undefined)
        );

        return {
            isValid,
            coerced: false,
            validExample,
            errors: allErrors
        };
    }

    private convertField({
        field,
        seenMessages,
        fieldName
    }: {
        field: FieldDescriptorProto;
        seenMessages: Set<string>;
        fieldName: string;
    }): ExampleConverter.Output {
        const isRepeated = field.label === FieldDescriptorProto_Label.REPEATED;

        if (isRepeated) {
            return this.convertRepeatedField({ field, seenMessages, fieldName });
        }

        return this.convertSingleField({ field, seenMessages, fieldName });
    }

    private convertRepeatedField({
        field,
        seenMessages,
        fieldName
    }: {
        field: FieldDescriptorProto;
        seenMessages: Set<string>;
        fieldName: string;
    }): ExampleConverter.Output {
        // Generate a single example element for repeated fields
        const singleResult = this.convertSingleField({
            field,
            seenMessages,
            fieldName
        });
        
        return {
            isValid: true,
            coerced: false,
            validExample: [singleResult.validExample],
            errors: singleResult.errors
        };
    }

    private convertSingleField({
        field,
        seenMessages,
        fieldName
    }: {
        field: FieldDescriptorProto;
        seenMessages: Set<string>;
        fieldName: string;
    }): ExampleConverter.Output {
        // Generate contextual examples based on field name
        if (field.type === FieldDescriptorProto_Type.STRING) {
            if (fieldName.toLowerCase().includes('email')) {
                return this.convertString(this.EXAMPLE_EMAIL);
            }
            if (fieldName.toLowerCase().includes('id')) {
                return this.convertString(this.EXAMPLE_ID);
            }
            if (fieldName.toLowerCase().includes('date') || fieldName.toLowerCase().includes('time')) {
                return this.convertString(this.EXAMPLE_DATE);
            }
        }

        switch (field.type) {
            case FieldDescriptorProto_Type.DOUBLE:
            case FieldDescriptorProto_Type.FLOAT:
            case FieldDescriptorProto_Type.INT64:
            case FieldDescriptorProto_Type.UINT64:
            case FieldDescriptorProto_Type.INT32:
            case FieldDescriptorProto_Type.FIXED64:
            case FieldDescriptorProto_Type.FIXED32:
            case FieldDescriptorProto_Type.UINT32:
            case FieldDescriptorProto_Type.SFIXED32:
            case FieldDescriptorProto_Type.SFIXED64:
            case FieldDescriptorProto_Type.SINT32:
            case FieldDescriptorProto_Type.SINT64:
                return this.convertNumber(fieldName);

            case FieldDescriptorProto_Type.BOOL:
                return this.convertBoolean(fieldName);

            case FieldDescriptorProto_Type.STRING:
                return this.convertString(this.EXAMPLE_STRING);

            case FieldDescriptorProto_Type.BYTES:
                return this.convertBytes(fieldName);

            case FieldDescriptorProto_Type.ENUM:
                return this.convertEnum(field, fieldName);

            case FieldDescriptorProto_Type.MESSAGE:
                return this.convertMessage_Field(field, seenMessages, fieldName);

            default:
                return {
                    isValid: false,
                    coerced: false,
                    validExample: null,
                    errors: [`Unsupported field type: ${field.type}`]
                };
        }
    }

    private convertNumber(fieldName: string): ExampleConverter.Output {
        return {
            isValid: true,
            coerced: false,
            validExample: this.EXAMPLE_NUMBER,
            errors: []
        };
    }

    private convertBoolean(fieldName: string): ExampleConverter.Output {
        return {
            isValid: true,
            coerced: false,
            validExample: this.EXAMPLE_BOOL,
            errors: []
        };
    }

    private convertString(value: string): ExampleConverter.Output {
        return {
            isValid: true,
            coerced: false,
            validExample: value,
            errors: []
        };
    }

    private convertBytes(fieldName: string): ExampleConverter.Output {
        return {
            isValid: true,
            coerced: false,
            validExample: this.EXAMPLE_BYTES,
            errors: []
        };
    }

    private convertEnum(field: FieldDescriptorProto, fieldName: string): ExampleConverter.Output {
        // Find enum in file descriptors
        const enumType = this.findEnumType(field.typeName ?? "");
        if (!enumType) {
            return {
                isValid: false,
                coerced: false,
                validExample: 0,
                errors: [`Enum type ${field.typeName} not found`]
            };
        }

        if (enumType.value.length === 0) {
            return {
                isValid: true,
                coerced: false,
                validExample: 0,
                errors: []
            };
        }

        // Use the first enum value as the example
        const defaultValue = enumType.value[0];
        return {
            isValid: true,
            coerced: false,
            validExample: defaultValue?.number ?? 0,
            errors: []
        };
    }

    private convertMessage_Field(
        field: FieldDescriptorProto,
        seenMessages: Set<string>,
        fieldName: string
    ): ExampleConverter.Output {
        const messageType = this.findMessageType(field.typeName ?? "");
        if (!messageType) {
            return {
                isValid: false,
                coerced: false,
                validExample: {},
                errors: [`Message type ${field.typeName} not found`]
            };
        }

        const converter = new ExampleConverter({
            breadcrumbs: [...this.breadcrumbs, fieldName],
            context: this.context,
            message: messageType,
            depth: this.depth + 1,
            seenMessages
        });

        return converter.convert();
    }

    private findEnumType(typeName: string): EnumDescriptorProto | undefined {
        // Look up enum in the file descriptors
        const fileDescriptor = this.context.spec;
        for (const enumType of fileDescriptor.enumType) {
            if (enumType.name === typeName) {
                return enumType;
            }
        }
        return undefined;
    }

    private findMessageType(typeName: string): DescriptorProto | undefined {
        // Look up message in the file descriptors
        const fileDescriptor = this.context.spec;
        for (const messageType of fileDescriptor.messageType) {
            if (messageType.name === typeName) {
                return messageType;
            }
        }
        return undefined;
    }
}