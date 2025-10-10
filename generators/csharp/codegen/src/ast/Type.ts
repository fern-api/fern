import { PrimitiveTypeV1 } from "@fern-fern/ir-sdk/api";
import { type CSharp } from "../csharp";
import { ClassReference } from "./ClassReference";
import { CoreClassReference } from "./CoreClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { TypeLiteral } from "./TypeLiteral";
import { TypeParameter } from "./TypeParameter";

/**
 * Type is now polymorphic, which is far easier to work with than doing switch statements on
 * an inner value in the type.
 */
export abstract class Type extends AstNode {
    public abstract write(writer: Writer, parentType?: Type): void;
    public isReferenceType(): boolean | undefined {
        return false;
    }
    public abstract cloneOptionalWithUnderlyingType(underlyingType: Type): Type;
    public toOptionalIfNotAlready(): Type {
        return this.csharp.Type.optional(this);
    }

    public writeEmptyCollectionInitializer(writer: Writer): void {
        // default - no-op
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }

    // Default implementations for common patterns
    public isCollection(): boolean {
        return false;
    }

    public getCollectionItemType(): Type | undefined {
        return undefined;
    }

    public getDefaultValue(): TypeLiteral {
        return this.csharp.TypeLiteral.null();
    }

    public get isAsyncEnumerable(): boolean {
        return false; // Override in ReferenceType if needed
    }

    public unwrapIfOptional(): Type {
        return this;
    }

    public abstract readonly type: string;

    public isOptional(): boolean {
        return false;
    }
}

// Concrete type implementations
export class IntegerType extends Type {
    public write(writer: Writer): void {
        writer.write("int");
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public getDefaultValue(): TypeLiteral {
        return this.csharp.TypeLiteral.integer(0);
    }
    public get type() {
        return "int";
    }
}

export class LongType extends Type {
    public write(writer: Writer): void {
        writer.write("long");
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public getDefaultValue(): TypeLiteral {
        return this.csharp.TypeLiteral.long(0);
    }
    public get type() {
        return "long";
    }
}

export class UintType extends Type {
    public write(writer: Writer): void {
        writer.write("uint");
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }
    public get type() {
        return "uint";
    }
}

export class UlongType extends Type {
    public write(writer: Writer): void {
        writer.write("ulong");
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }
    public get type() {
        return "ulong";
    }
}

export class StringType extends Type {
    public write(writer: Writer): void {
        writer.write("string");
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public getDefaultValue(): TypeLiteral {
        return this.csharp.TypeLiteral.string("");
    }
    public get type() {
        return "string";
    }
}

export class BooleanType extends Type {
    public write(writer: Writer): void {
        writer.write("bool");
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public getDefaultValue(): TypeLiteral {
        return this.csharp.TypeLiteral.boolean(false);
    }
    public get type() {
        return "boolean";
    }
}

export class FloatType extends Type {
    public write(writer: Writer): void {
        writer.write("float");
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }
    public get type() {
        return "float";
    }
}

export class DoubleType extends Type {
    public write(writer: Writer): void {
        writer.write("double");
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }
    public get type() {
        return "double";
    }
}

export class DateOnlyType extends Type {
    public write(writer: Writer): void {
        writer.write("DateOnly");
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }
    public get type() {
        return "dateOnly";
    }
}

export class DateTimeType extends Type {
    public write(writer: Writer): void {
        writer.write("DateTime");
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }
    public get type() {
        return "dateTime";
    }
}

export class UuidType extends Type {
    public write(writer: Writer): void {
        writer.write("string");
    }

    public isReferenceType(): boolean | undefined {
        return true; // C# GUID is a value type, but we use string for UUID
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }
    public get type() {
        return "uuid";
    }
}

export class ObjectType extends Type {
    public write(writer: Writer): void {
        writer.write("object");
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }
    public get type() {
        return "object";
    }
}

export class ArrayType extends Type {
    constructor(
        public readonly value: Type,
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        if (isReadOnlyMemoryType({ writer, value: this.value })) {
            this.writeReadOnlyMemoryType({ writer, value: this.value });
            return;
        }
        this.value.write(writer);
        writer.write("[]");
    }

    public isCollection(): boolean {
        return true;
    }

    public getCollectionItemType(): Type | undefined {
        return this.value;
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    private writeReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): void {
        writer.write("ReadOnlyMemory<");
        value.write(writer);
        writer.write(">");
    }
    public get type() {
        return "array";
    }
}

export class ListTypeType extends Type {
    constructor(
        public readonly value: Type,
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        if (isReadOnlyMemoryType({ writer, value: this.value })) {
            this.writeReadOnlyMemoryType({ writer, value: this.value });
            return;
        }
        writer.write("List<");
        this.value.write(writer);
        writer.write(">");
    }

    public writeEmptyCollectionInitializer(writer: Writer): void {
        if (isReadOnlyMemoryType({ writer, value: this.value })) {
            return;
        }
        writer.write(" = new List<");
        this.value.write(writer);
        writer.write(">();");
    }

    public isCollection(): boolean {
        return true;
    }

    public getCollectionItemType(): Type | undefined {
        return this.value;
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    private writeReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): void {
        writer.write("ReadOnlyMemory<");
        value.write(writer);
        writer.write(">");
    }
    public get type() {
        return "listType";
    }
}

export class ListType extends Type {
    constructor(
        public readonly value: Type,
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        if (isReadOnlyMemoryType({ writer, value: this.value })) {
            this.writeReadOnlyMemoryType({ writer, value: this.value });
            return;
        }
        writer.write("IEnumerable<");
        this.value.write(writer);
        writer.write(">");
    }

    public writeEmptyCollectionInitializer(writer: Writer): void {
        if (isReadOnlyMemoryType({ writer, value: this.value })) {
            return;
        }
        writer.write(" = new List<");
        this.value.write(writer);
        writer.write(">();");
    }

    public isCollection(): boolean {
        return true;
    }

    public getCollectionItemType(): Type {
        return this.value;
    }

    public isReferenceType(): boolean {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    private writeReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): void {
        writer.write("ReadOnlyMemory<");
        value.write(writer);
        writer.write(">");
    }
    public get type() {
        return "list";
    }
}

export class SetType extends Type {
    constructor(
        public readonly value: Type,
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        writer.write("HashSet<");
        this.value.write(writer);
        writer.write(">");
    }

    public writeEmptyCollectionInitializer(writer: Writer): void {
        writer.write(" = new HashSet<");
        this.value.write(writer);
        writer.write(">();");
    }

    public isCollection(): boolean {
        return true;
    }

    public getCollectionItemType(): Type | undefined {
        return this.value;
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }
    public get type() {
        return "set";
    }
}

export class MapType extends Type {
    constructor(
        public readonly keyType: Type,
        public readonly valueType: Type,
        csharp: CSharp,
        public readonly options?: { dontSimplify?: boolean }
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        if (
            this.options?.dontSimplify !== true &&
            writer.getSimplifyObjectDictionaries() &&
            this.keyType instanceof StringType &&
            this.valueType instanceof OptionalType &&
            this.valueType.value instanceof ObjectType
        ) {
            writer.write("object");
            return;
        }
        writer.write("Dictionary<");
        this.keyType.write(writer);
        writer.write(", ");
        this.valueType.write(writer);
        writer.write(">");
    }

    public writeEmptyCollectionInitializer(writer: Writer): void {
        writer.write(" = new Dictionary<");
        this.keyType.write(writer);
        writer.write(", ");
        this.valueType.write(writer);
        writer.write(">();");
    }

    public isCollection(): boolean {
        return true;
    }

    public getCollectionItemType(): Type | undefined {
        return this.csharp.Type.keyValuePair(this.keyType, this.valueType);
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }
    public get type() {
        return "map";
    }
}

export class IDictionaryType extends Type {
    constructor(
        public readonly keyType: Type,
        public readonly valueType: Type,
        csharp: CSharp,
        public readonly options?: { dontSimplify?: boolean }
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        if (
            this.options?.dontSimplify !== true &&
            writer.getSimplifyObjectDictionaries() &&
            this.keyType instanceof StringType &&
            this.valueType instanceof OptionalType &&
            this.valueType.value instanceof ObjectType
        ) {
            writer.write("object");
            return;
        }
        writer.write("IDictionary<");
        this.keyType.write(writer);
        writer.write(", ");
        this.valueType.write(writer);
        writer.write(">");
    }

    public isCollection(): boolean {
        return true;
    }

    public getCollectionItemType(): Type | undefined {
        return this.csharp.Type.keyValuePair(this.keyType, this.valueType);
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }
    public get type() {
        return "idictionary";
    }
}

export class KeyValuePairType extends Type {
    constructor(
        public readonly keyType: Type,
        public readonly valueType: Type,
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        writer.write("KeyValuePair<");
        this.keyType.write(writer);
        writer.write(", ");
        this.valueType.write(writer);
        writer.write(">");
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }

    public get type() {
        return "keyValuePair";
    }
}

export class OptionalType extends Type {
    constructor(
        public readonly value: Type,
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer, parentType?: Type): void {
        this.value.write(writer, this);
        // avoid double optional
        if (!(parentType instanceof OptionalType)) {
            writer.write("?");
        }
    }

    public isOptional(): boolean {
        return true;
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return this.csharp.Type.optional(this.value.cloneOptionalWithUnderlyingType(underlyingType));
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return this.value;
    }

    public unwrapIfOptional(): Type {
        return this.value;
    }

    public toOptionalIfNotAlready(): Type {
        return this;
    }
    public get type() {
        return "optional";
    }
}

export class ReferenceType extends Type {
    constructor(
        public readonly value: ClassReference,
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        writer.writeNode(this.value);
    }

    public isReferenceType(): boolean | undefined {
        return undefined;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }

    public get isAsyncEnumerable(): boolean {
        return this.value.isAsyncEnumerable;
    }
    public get type() {
        return "reference";
    }
}

export class CoreReferenceType extends Type {
    constructor(
        public readonly value: CoreClassReference,
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        writer.write(this.value.name);
    }

    public isReferenceType(): boolean | undefined {
        return undefined;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }
    public get type() {
        return "coreReference";
    }
}

export class OneOfType extends Type {
    constructor(
        public readonly memberValues: Type[],
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        const oneOf = this.csharp.OneOf.OneOf(this.memberValues);
        writer.addReference(oneOf);
        writer.writeNode(oneOf);
    }

    public oneOfTypes(): Type[] {
        return this.memberValues;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }

    public get type() {
        return "oneOf";
    }
}

export class OneOfBaseType extends Type {
    constructor(
        public readonly memberValues: Type[],
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        const oneOfBase = this.csharp.OneOf.OneOfBase(this.memberValues);
        writer.addReference(oneOfBase);
        writer.writeNode(oneOfBase);
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }

    public get type() {
        return "oneOfBase";
    }
}

export class StringEnumType extends Type {
    constructor(
        public readonly value: ClassReference,
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        // todo: how to get a proper reference to the <namespace>.StringEnum class
        // at this point? (it has been working because the .Core namespace is always imported I guess)
        // writer.addReference(writer.context.getStringEnumClassReference());
        // formerly writer.addReference(StringEnumClassReference); (from classreference.ts)
        writer.write("StringEnum<");
        this.value.write(writer);
        writer.write(">");
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public get type() {
        return "stringEnum";
    }
}

export class ActionType extends Type {
    constructor(
        public readonly typeParameters: (Type | TypeParameter)[],
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        writer.write("Action");
        if (this.typeParameters.length > 0) {
            writer.write("<");
            this.typeParameters.forEach((type, index) => {
                if (index !== 0) {
                    writer.write(", ");
                }
                type.write(writer);
            });
            writer.write(">");
        }
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }

    public get type() {
        return "action";
    }
}

export class FuncType extends Type {
    constructor(
        public readonly typeParameters: (Type | TypeParameter)[],
        public readonly returnType: Type | TypeParameter,
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        writer.write("Func");
        writer.write("<");
        [...this.typeParameters, this.returnType].forEach((type, index) => {
            if (index !== 0) {
                writer.write(", ");
            }
            type.write(writer);
        });
        writer.write(">");
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }

    public get type() {
        return "func";
    }
}

export class FileParameterType extends Type {
    constructor(
        public readonly value: ClassReference,
        csharp: CSharp
    ) {
        super(csharp);
    }

    public write(writer: Writer): void {
        writer.writeNode(this.value);
    }

    public isCollection(): boolean {
        return false;
    }

    public getCollectionItemType(): Type | undefined {
        return undefined;
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }

    public get type() {
        return "fileParam";
    }
}

export class CsharpTypeType extends Type {
    public write(writer: Writer): void {
        writer.write("global::System.Type");
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }

    public get type() {
        return "csharpType";
    }
}

export class BinaryType extends Type {
    public write(writer: Writer): void {
        writer.write("byte[]");
    }

    public isReferenceType(): boolean | undefined {
        return true;
    }

    public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
        return underlyingType;
    }

    public underlyingTypeIfOptional(): Type | undefined {
        return undefined;
    }

    public get type() {
        return "byte";
    }
}

// Export interfaces for backward compatibility
export interface IDictionary {
    type: "idictionary";
    keyType: Type;
    valueType: Type;
    options?: IDictionary.Options;
}

export namespace IDictionary {
    export interface Options {
        dontSimplify?: boolean;
    }
}

export interface Map {
    type: "map";
    keyType: Type;
    valueType: Type;
    options?: Map.Options;
}

export namespace Map {
    export interface Options {
        dontSimplify?: boolean;
    }
}

export function convertReadOnlyPrimitiveTypes(readOnlyMemoryTypeNames: string[]): PrimitiveTypeV1[] {
    return readOnlyMemoryTypeNames.map((typeName) => {
        switch (typeName) {
            case "int":
                return PrimitiveTypeV1.Integer;
            case "long":
                return PrimitiveTypeV1.Long;
            case "uint":
                return PrimitiveTypeV1.Uint;
            case "ulong":
                return PrimitiveTypeV1.Uint64;
            case "string":
                return PrimitiveTypeV1.String;
            case "bool":
                return PrimitiveTypeV1.Boolean;
            case "float":
                return PrimitiveTypeV1.Float;
            case "double":
                return PrimitiveTypeV1.Double;
            default:
                // This should be unreachable; the ReadOnlyMemory types should have already
                // been validated at this point.
                throw new Error(`Internal error; unknown ReadOnlyMemory type: ${typeName}`);
        }
    });
}

function isReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): boolean {
    if (value instanceof OptionalType) {
        return isReadOnlyMemoryType({ writer, value: value.value });
    }
    // Check if it's a primitive type that should be ReadOnlyMemory
    if (value instanceof IntegerType) {
        return writer.isReadOnlyMemoryType("int");
    }
    if (value instanceof LongType) {
        return writer.isReadOnlyMemoryType("long");
    }
    if (value instanceof UintType) {
        return writer.isReadOnlyMemoryType("uint");
    }
    if (value instanceof UlongType) {
        return writer.isReadOnlyMemoryType("ulong");
    }
    if (value instanceof StringType) {
        return writer.isReadOnlyMemoryType("string");
    }
    if (value instanceof BooleanType) {
        return writer.isReadOnlyMemoryType("bool");
    }
    if (value instanceof FloatType) {
        return writer.isReadOnlyMemoryType("float");
    }
    if (value instanceof DoubleType) {
        return writer.isReadOnlyMemoryType("double");
    }
    return false;
}
