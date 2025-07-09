import {
    DescriptorProto,
    EnumDescriptorProto,
    FieldDescriptorProto,
    FieldDescriptorProto_Label,
    FieldDescriptorProto_Type,
    FileDescriptorProto
} from "@bufbuild/protobuf/wkt";
import { AbstractConverter } from "@fern-api/v2-importer-commons";
import { ProtofileConverterContext } from "../ProtofileConverterContext";

export declare namespace ExampleConverter {
    export interface Args extends AbstractConverter.Args<ProtofileConverterContext> {
        message: DescriptorProto;
        type: "request" | "response";
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

    private readonly message: DescriptorProto;
    private readonly type: "request" | "response";
    private readonly depth: number;
    private readonly seenMessages: Set<string>;

    constructor({
        breadcrumbs,
        context,
        message,
        type,
        depth = 0,
        seenMessages = new Set()
    }: ExampleConverter.Args) {
        super({ context, breadcrumbs });
        this.message = message;
        this.type = type;
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

        // Get fully qualified message name
        const messageName = this.getFullyQualifiedMessageName(this.message);
        
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

    private getFullyQualifiedMessageName(message: DescriptorProto): string {
        // Get the package name from the current file
        const packageName = this.context.spec.package || "";
        const messageName = message.name || "";
        
        if (packageName) {
            return `${packageName}.${messageName}`;
        }
        return messageName;
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
            isValid: singleResult.isValid,
            coerced: false,
            validExample: singleResult.isValid ? [singleResult.validExample] : [],
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

            // case FieldDescriptorProto_Type.MESSAGE:
            //     return this.convertMessage_Field(field, seenMessages, fieldName);

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
        const typeName = field.typeName ?? "";
        const normalizedTypeName = this.context.maybeRemoveLeadingPeriod(typeName);
        
        // Find the enum descriptor directly
        const enumType = this.findEnumType(normalizedTypeName);
        
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

    // private convertMessage_Field(
    //     field: FieldDescriptorProto,
    //     seenMessages: Set<string>,
    //     fieldName: string
    // ): ExampleConverter.Output {
    //     const typeName = field.typeName;
    //     if (!typeName) {
    //         return {
    //             isValid: false,
    //             coerced: false,
    //             validExample: null,
    //             errors: [`Missing type name for message field ${fieldName}`]
    //         };
    //     }

    //     const normalizedTypeName = this.context.maybeRemoveLeadingPeriod(typeName);
        
    //     // Try to find message type in current file first
    //     let messageType = this.findMessageInFile(normalizedTypeName, this.context.spec);
    //     let targetContext = this.context;
        
    //     // If not found, search in all files from codeGeneratorRequest
    //     if (!messageType && this.context.getCodeGeneratorRequest()) {
    //         for (const file of this.context.getCodeGeneratorRequest().protoFile) {
    //             messageType = this.findMessageInFile(normalizedTypeName, file);
    //             if (messageType) {
    //                 // Create a new context for the target file if needed
    //                 if (file !== this.context.spec) {
    //                     targetContext = {
    //                         ...this.context,
    //                         spec: file
    //                     };
    //                 }
    //                 break;
    //             }
    //         }
    //     }
        
    //     if (!messageType) {
    //         return {
    //             isValid: false,
    //             coerced: false,
    //             validExample: null,
    //             errors: [`Could not find message type ${normalizedTypeName}`]
    //         };
    //     }

    //     const converter = new ExampleConverter({
    //         context: targetContext,
    //         breadcrumbs: [...this.breadcrumbs, fieldName],
    //         message: messageType,
    //         type: this.type,
    //         depth: this.depth + 1,
    //         seenMessages
    //     });

    //     return converter.convert();
    // }

    private findEnumType(typeName: string): EnumDescriptorProto | undefined {
        // First try to find in current file
        let enumType = this.findEnumInFile(typeName, this.context.spec);
        
        // If not found and we have codeGeneratorRequest, search all files
        if (!enumType && this.context.getCodeGeneratorRequest()) {
            for (const file of this.context.getCodeGeneratorRequest().protoFile) {
                enumType = this.findEnumInFile(typeName, file);
                if (enumType) break;
            }
        }
        
        return enumType;
    }

    private findMessageType(typeName: string): DescriptorProto | undefined {
        // First try to find in current file
        let messageType = this.findMessageInFile(typeName, this.context.spec);
        
        // If not found and we have codeGeneratorRequest, search all files
        if (!messageType && this.context.getCodeGeneratorRequest()) {
            for (const file of this.context.getCodeGeneratorRequest().protoFile) {
                messageType = this.findMessageInFile(typeName, file);
                if (messageType) break;
            }
        }
        
        return messageType;
    }

    private findEnumInFile(typeName: string, file: FileDescriptorProto): EnumDescriptorProto | undefined {
        const packageName = file.package || "";
        
        // Check top-level enums
        for (const enumType of file.enumType) {
            const fullName = packageName ? `${packageName}.${enumType.name}` : enumType.name || "";
            if (fullName === typeName || enumType.name === typeName) {
                return enumType;
            }
        }
        
        // Check nested enums in messages
        for (const message of file.messageType) {
            const enum_ = this.findEnumInMessage(typeName, message, packageName);
            if (enum_) return enum_;
        }
        
        return undefined;
    }

    private findEnumInMessage(
        typeName: string, 
        message: DescriptorProto, 
        packagePrefix: string
    ): EnumDescriptorProto | undefined {
        const messagePrefix = packagePrefix 
            ? `${packagePrefix}.${message.name}` 
            : message.name || "";
            
        // Check enums in this message
        for (const enumType of message.enumType) {
            const fullName = `${messagePrefix}.${enumType.name}`;
            if (fullName === typeName || enumType.name === typeName) {
                return enumType;
            }
        }
        
        // Check nested messages
        for (const nestedMessage of message.nestedType) {
            const enum_ = this.findEnumInMessage(typeName, nestedMessage, messagePrefix);
            if (enum_) return enum_;
        }
        
        return undefined;
    }

    private findMessageInFile(typeName: string, file: FileDescriptorProto): DescriptorProto | undefined {
        const packageName = file.package || "";
        
        // Check top-level messages
        for (const messageType of file.messageType) {
            const fullName = packageName ? `${packageName}.${messageType.name}` : messageType.name || "";
            if (fullName === typeName || messageType.name === typeName) {
                return messageType;
            }
        }
        
        // Check nested messages
        for (const message of file.messageType) {
            const nestedMessage = this.findNestedMessage(typeName, message, packageName);
            if (nestedMessage) return nestedMessage;
        }
        
        return undefined;
    }

    private findNestedMessage(
        typeName: string, 
        message: DescriptorProto, 
        packagePrefix: string
    ): DescriptorProto | undefined {
        const messagePrefix = packagePrefix 
            ? `${packagePrefix}.${message.name}` 
            : message.name || "";
            
        // Check nested messages
        for (const nestedMessage of message.nestedType) {
            const fullName = `${messagePrefix}.${nestedMessage.name}`;
            if (fullName === typeName || nestedMessage.name === typeName) {
                return nestedMessage;
            }
            
            // Recursively check deeper nested messages
            const deeperNested = this.findNestedMessage(typeName, nestedMessage, messagePrefix);
            if (deeperNested) return deeperNested;
        }
        
        return undefined;
    }
}