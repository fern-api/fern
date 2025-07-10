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
import { initializeGlobalCommentsStore } from "../utils/CreateGlobalCommentsStore";
import { Logger } from "../../commons/logging";

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
            const convertedMessage = this.convertMessage(newSeenMessages);
            return convertedMessage;
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

        for (const field of this.message.field) {
            const hasOneofIndex = Object.prototype.hasOwnProperty.call(field, "oneofIndex");
            if (hasOneofIndex && field.oneofIndex != null) {
                if (!oneofChoices.has(field.oneofIndex)) {
                    oneofChoices.set(field.oneofIndex, field);
                }
            }
        }

        for (const field of this.message.field) {
            const fieldName = field.name ?? "";
            if (!fieldName) continue;


            const hasOneofIndex = Object.prototype.hasOwnProperty.call(field, "oneofIndex");
            if (hasOneofIndex && field.oneofIndex != null) {
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
            Array.from(resultsByFieldName.entries())
                .filter(([_, { result }]) => result.isValid && result.validExample !== null && result.validExample !== undefined)
                .map(([fieldName, { result }]) => [fieldName, result.validExample])
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
                return this.convertNumber();

            case FieldDescriptorProto_Type.BOOL:
                return this.convertBoolean();

            case FieldDescriptorProto_Type.STRING:
                return this.convertString(this.EXAMPLE_STRING);

            case FieldDescriptorProto_Type.BYTES:
                return this.convertBytes();

            case FieldDescriptorProto_Type.ENUM:
                return this.convertEnum(field);

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

    private convertNumber(): ExampleConverter.Output {
        return {
            isValid: true,
            coerced: false,
            validExample: this.EXAMPLE_NUMBER,
            errors: []
        };
    }

    private convertBoolean(): ExampleConverter.Output {
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

    private convertBytes(): ExampleConverter.Output {
        return {
            isValid: true,
            coerced: false,
            validExample: this.EXAMPLE_BYTES,
            errors: []
        };
    }

    private convertEnum(field: FieldDescriptorProto): ExampleConverter.Output {
        const typeName = field.typeName ?? "";
        const normalizedTypeName = this.context.maybeRemoveLeadingPeriod(typeName);
        
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
        const typeName = field.typeName;
        if (!typeName) {
            return {
                isValid: false,
                coerced: false,
                validExample: null,
                errors: [`Missing type name for message field ${fieldName}`]
            };
        }

        const normalizedTypeName = this.context.maybeRemoveLeadingPeriod(typeName);

        let messageType: DescriptorProto | undefined;
        let newMessageContext: ProtofileConverterContext | undefined;
        if (this.context.getCodeGeneratorRequest()) {
            for (const file of this.context.getCodeGeneratorRequest().protoFile) {
                const result = this.context.resolveTypeIdToProtoFile(normalizedTypeName);
                if (result.ok) {
                    messageType = result.message;
                    if (result.protoFileName !== this.context.spec.name) {
                        newMessageContext = new ProtofileConverterContext({
                            ...this.context,
                            comments: initializeGlobalCommentsStore(),
                            codeGeneratorRequest: this.context.getCodeGeneratorRequest(),
                            spec: file,
                            logger: new Logger()
                        })
                    } else {
                        newMessageContext = this.context;
                    }
                    break;
                }
            }
        }
        
        if (!messageType || !newMessageContext) {
            return {
                // HACKHACK: This is a hack to get around not showing any example
                isValid: true,
                coerced: false,
                validExample: null,
                errors: [`Could not find message type ${normalizedTypeName}`]
            };
        }

        const converter = new ExampleConverter({
            context: newMessageContext,
            breadcrumbs: [...this.breadcrumbs, fieldName],
            message: messageType,
            type: this.type,
            depth: this.depth + 1,
            seenMessages
        });
        const result = converter.convert();
        return result;
    }

    private findEnumType(typeName: string): EnumDescriptorProto | undefined {
        let enumType = this.findEnumInFile(typeName, this.context.spec);
        
        if (!enumType && this.context.getCodeGeneratorRequest()) {
            for (const file of this.context.getCodeGeneratorRequest().protoFile) {
                enumType = this.findEnumInFile(typeName, file);
                if (enumType) break;
            }
        }
        
        return enumType;
    }

    private findEnumInFile(typeName: string, file: FileDescriptorProto): EnumDescriptorProto | undefined {
        const packageName = file.package || "";
        
        for (const enumType of file.enumType) {
            const fullName = packageName ? `${packageName}.${enumType.name}` : enumType.name || "";
            if (fullName === typeName || enumType.name === typeName) {
                return enumType;
            }
        }
        
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
            
        for (const enumType of message.enumType) {
            const fullName = `${messagePrefix}.${enumType.name}`;
            if (fullName === typeName || enumType.name === typeName) {
                return enumType;
            }
        }
        
        for (const nestedMessage of message.nestedType) {
            const enum_ = this.findEnumInMessage(typeName, nestedMessage, messagePrefix);
            if (enum_) return enum_;
        }
        
        return undefined;
    }
}