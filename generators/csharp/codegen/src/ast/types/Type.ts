import { PrimitiveTypeV1 } from "@fern-fern/ir-sdk/api";
import { type Generation } from "../../context/generation-info";
import { TypeLiteral } from "../code/TypeLiteral";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { ClassReference } from "./ClassReference";
import { CoreClassReference } from "./CoreClassReference";
import { TypeParameter } from "./TypeParameter";

/**
 * Type is now polymorphic, which is far easier to work with than doing switch statements on
 * an inner value in the type.
 */
export abstract class Type extends AstNode {
    public abstract override write(writer: Writer, parentType?: Type): void;
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

export namespace Type {
    // Concrete type implementations
    export class Integer extends Type {
        public write(writer: Writer): void {
            writer.write("int");
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override getDefaultValue(): TypeLiteral {
            return this.csharp.TypeLiteral.integer(0);
        }
        public get type() {
            return "int";
        }
    }

    export class Long extends Type {
        public write(writer: Writer): void {
            writer.write("long");
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override getDefaultValue(): TypeLiteral {
            return this.csharp.TypeLiteral.long(0);
        }
        public get type() {
            return "long";
        }
    }

    export class Uint extends Type {
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

    export class ULong extends Type {
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

    export class String extends Type {
        public write(writer: Writer): void {
            writer.write("string");
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override getDefaultValue(): TypeLiteral {
            return this.csharp.TypeLiteral.string("");
        }
        public get type() {
            return "string";
        }
    }

    export class Boolean extends Type {
        public write(writer: Writer): void {
            writer.write("bool");
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override getDefaultValue(): TypeLiteral {
            return this.csharp.TypeLiteral.boolean(false);
        }
        public get type() {
            return "boolean";
        }
    }

    export class Float extends Type {
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

    export class Double extends Type {
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

    export class DateOnly extends Type {
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

    export class DateTime extends Type {
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

    export class Uuid extends Type {
        public write(writer: Writer): void {
            writer.write("string");
        }

        public override isReferenceType(): boolean | undefined {
            return true; // C# GUID is a value type, but we use string for UUID
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }
        public get type() {
            return "uuid";
        }
    }

    export class Object extends Type {
        public write(writer: Writer): void {
            writer.write("object");
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }
        public get type() {
            return "object";
        }
    }

    export class Array extends Type {
        constructor(
            public readonly value: Type,
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            if (isReadOnlyMemoryType({ writer, value: this.value })) {
                this.writeReadOnlyMemoryType({ writer, value: this.value });
                return;
            }
            this.value.write(writer);
            writer.write("[]");
        }

        public override isCollection(): boolean {
            return true;
        }

        public override getCollectionItemType(): Type | undefined {
            return this.value;
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        private writeReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): void {
            writer.writeNode(this.extern.System.ReadOnlyMemory(value));
        }
        public get type() {
            return "array";
        }
    }

    export class ListType extends Type {
        constructor(
            public readonly value: Type,
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            if (isReadOnlyMemoryType({ writer, value: this.value })) {
                this.writeReadOnlyMemoryType({ writer, value: this.value });
                return;
            }
            writer.writeNode(this.extern.System.Collections.Generic.List(this.value));
        }

        public override writeEmptyCollectionInitializer(writer: Writer): void {
            if (isReadOnlyMemoryType({ writer, value: this.value })) {
                return;
            }
            writer.write(" = new ", this.extern.System.Collections.Generic.List(this.value), "();");
        }

        public override isCollection(): boolean {
            return true;
        }

        public override getCollectionItemType(): Type | undefined {
            return this.value;
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        private writeReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): void {
            writer.writeNode(this.extern.System.ReadOnlyMemory(value));
        }
        public get type() {
            return "listType";
        }
    }

    export class List extends Type {
        constructor(
            public readonly value: Type,
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            if (isReadOnlyMemoryType({ writer, value: this.value })) {
                this.writeReadOnlyMemoryType({ writer, value: this.value });
                return;
            }
            writer.writeNode(this.extern.System.Collections.Generic.IEnumerable(this.value));
        }

        public override writeEmptyCollectionInitializer(writer: Writer): void {
            if (isReadOnlyMemoryType({ writer, value: this.value })) {
                return;
            }
            writer.write(" = new List<");
            this.value.write(writer);
            writer.write(">();");
        }

        public override isCollection(): boolean {
            return true;
        }

        public override getCollectionItemType(): Type {
            return this.value;
        }

        public override isReferenceType(): boolean {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        private writeReadOnlyMemoryType({ writer, value }: { writer: Writer; value: Type }): void {
            writer.writeNode(this.extern.System.ReadOnlyMemory(value));
        }
        public get type() {
            return "list";
        }
    }

    export class Set extends Type {
        constructor(
            public readonly value: Type,
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            writer.writeNode(this.extern.System.Collections.Generic.HashSet(this.value));
        }

        public override writeEmptyCollectionInitializer(writer: Writer): void {
            writer.write(" = new HashSet<");
            this.value.write(writer);
            writer.write(">();");
        }

        public override isCollection(): boolean {
            return true;
        }

        public override getCollectionItemType(): Type | undefined {
            return this.value;
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }
        public get type() {
            return "set";
        }
    }

    export class Map extends Type {
        constructor(
            public readonly keyType: Type,
            public readonly valueType: Type,
            generation: Generation,
            public readonly options?: { dontSimplify?: boolean }
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            if (
                this.options?.dontSimplify !== true &&
                writer.generation.settings.simplifyObjectDictionaries &&
                this.keyType instanceof Type.String &&
                this.valueType instanceof Type.Optional &&
                this.valueType.value instanceof Type.Object
            ) {
                writer.write("object");
                return;
            }
            writer.write(this.extern.System.Collections.Generic.Dictionary(this.keyType, this.valueType));
        }

        public override writeEmptyCollectionInitializer(writer: Writer): void {
            writer.writeStatement(
                " = new ",
                this.extern.System.Collections.Generic.Dictionary(this.keyType, this.valueType),
                "()"
            );
        }

        public override isCollection(): boolean {
            return true;
        }

        public override getCollectionItemType(): Type | undefined {
            return this.csharp.Type.keyValuePair(this.keyType, this.valueType);
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return undefined;
        }
        public get type() {
            return "map";
        }
    }

    export class IDictionary extends Type {
        constructor(
            public readonly keyType: Type,
            public readonly valueType: Type,
            generation: Generation,
            public readonly options?: { dontSimplify?: boolean }
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            if (
                this.options?.dontSimplify !== true &&
                writer.generation.settings.simplifyObjectDictionaries &&
                this.keyType instanceof Type.String &&
                this.valueType instanceof Type.Optional &&
                this.valueType.value instanceof Type.Object
            ) {
                writer.write("object");
                return;
            }
            writer.writeNode(this.extern.System.Collections.Generic.IDictionary(this.keyType, this.valueType));
        }

        public override isCollection(): boolean {
            return true;
        }

        public override getCollectionItemType(): Type | undefined {
            return this.csharp.Type.keyValuePair(this.keyType, this.valueType);
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return undefined;
        }
        public get type() {
            return "idictionary";
        }
    }

    export class KeyValuePair extends Type {
        constructor(
            public readonly keyType: Type,
            public readonly valueType: Type,
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            writer.writeNode(this.extern.System.Collections.Generic.KeyValuePair(this.keyType, this.valueType));
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return undefined;
        }

        public get type() {
            return "keyValuePair";
        }
    }

    export class Optional extends Type {
        constructor(
            public readonly value: Type,
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer, parentType?: Type): void {
            this.value.write(writer, this);
            // avoid double optional
            if (!(parentType instanceof Type.Optional)) {
                writer.write("?");
            }
        }

        public override isOptional(): boolean {
            return true;
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return this.csharp.Type.optional(this.value.cloneOptionalWithUnderlyingType(underlyingType));
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return this.value;
        }

        public override unwrapIfOptional(): Type {
            return this.value;
        }

        public override toOptionalIfNotAlready(): Type {
            return this;
        }
        public get type() {
            return "optional";
        }
    }

    export class Reference extends Type {
        constructor(
            public readonly value: ClassReference,
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            writer.writeNode(this.value);
        }

        public override isReferenceType(): boolean | undefined {
            return undefined;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return undefined;
        }

        public override get isAsyncEnumerable(): boolean {
            return this.value.isAsyncEnumerable;
        }
        public get type() {
            return "reference";
        }
    }

    export class CoreReference extends Type {
        constructor(
            public readonly value: CoreClassReference,
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            writer.write(this.value.name);
        }

        public override isReferenceType(): boolean | undefined {
            return undefined;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return undefined;
        }
        public get type() {
            return "coreReference";
        }
    }

    export class OneOf extends Type {
        constructor(
            public readonly memberValues: Type[],
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            const oneOf = this.extern.OneOf.OneOf(this.memberValues);
            writer.addReference(oneOf);
            writer.writeNode(oneOf);
        }

        public oneOfTypes(): Type[] {
            return this.memberValues;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return undefined;
        }

        public get type() {
            return "oneOf";
        }
    }

    export class OneOfBase extends Type {
        constructor(
            public readonly memberValues: Type[],
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            const oneOfBase = this.extern.OneOf.OneOfBase(this.memberValues);
            writer.addReference(oneOfBase);
            writer.writeNode(oneOfBase);
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return undefined;
        }

        public get type() {
            return "oneOfBase";
        }
    }

    export class StringEnum extends Type {
        constructor(
            public readonly value: ClassReference,
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            this.types.StringEnum(this.value).write(writer);
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public get type() {
            return "stringEnum";
        }
    }

    export class Action extends Type {
        constructor(
            public readonly typeParameters: (Type | TypeParameter)[],
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            this.System.Action(this.typeParameters).write(writer);
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return undefined;
        }

        public get type() {
            return "action";
        }
    }

    export class Func extends Type {
        constructor(
            public readonly typeParameters: (Type | TypeParameter)[],
            public readonly returnType: Type | TypeParameter,
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            writer.writeNode(this.extern.System.Func(this.typeParameters, this.returnType));
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return undefined;
        }

        public get type() {
            return "func";
        }
    }

    export class FileParameter extends Type {
        constructor(
            public readonly value: ClassReference,
            generation: Generation
        ) {
            super(generation);
        }

        public write(writer: Writer): void {
            writer.writeNode(this.value);
        }

        public override isCollection(): boolean {
            return false;
        }

        public override getCollectionItemType(): Type | undefined {
            return undefined;
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return undefined;
        }

        public get type() {
            return "fileParam";
        }
    }

    export class SystemType extends Type {
        public write(writer: Writer): void {
            writer.write("global::System.Type");
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return undefined;
        }

        public get type() {
            return "systemType";
        }
    }

    export class Binary extends Type {
        public write(writer: Writer): void {
            writer.write("byte[]");
        }

        public override isReferenceType(): boolean | undefined {
            return true;
        }

        public cloneOptionalWithUnderlyingType(underlyingType: Type): Type {
            return underlyingType;
        }

        public override underlyingTypeIfOptional(): Type | undefined {
            return undefined;
        }

        public get type() {
            return "byte";
        }
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
            case "boolean":
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
    if (value instanceof Type.Optional) {
        return isReadOnlyMemoryType({ writer, value: value.value });
    }
    // Check if it's a primitive type that should be ReadOnlyMemory
    if (value instanceof Type.Integer) {
        return writer.isReadOnlyMemoryType("int");
    }
    if (value instanceof Type.Long) {
        return writer.isReadOnlyMemoryType("long");
    }
    if (value instanceof Type.Uint) {
        return writer.isReadOnlyMemoryType("uint");
    }
    if (value instanceof Type.ULong) {
        return writer.isReadOnlyMemoryType("ulong");
    }
    if (value instanceof Type.String) {
        return writer.isReadOnlyMemoryType("string");
    }
    if (value instanceof Type.Boolean) {
        return writer.isReadOnlyMemoryType("bool");
    }
    if (value instanceof Type.Float) {
        return writer.isReadOnlyMemoryType("float");
    }
    if (value instanceof Type.Double) {
        return writer.isReadOnlyMemoryType("double");
    }
    return false;
}
