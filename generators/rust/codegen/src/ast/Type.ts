import { AstNode } from "./AstNode";
import { Reference } from "./Reference";
import { Writer } from "./Writer";
import { PrimitiveType } from "./types";

export abstract class Type extends AstNode {
    public static primitive(primitive: PrimitiveType): Type {
        return new PrimitiveTypeNode(primitive);
    }

    public static reference(reference: Reference): Type {
        return new ReferenceType(reference);
    }

    public static option(inner: Type): Type {
        return new OptionType(inner);
    }

    public static result(ok: Type, err: Type): Type {
        return new ResultType(ok, err);
    }

    public static vec(inner: Type): Type {
        return new VecType(inner);
    }

    public static hashMap(key: Type, value: Type): Type {
        return new HashMapType(key, value);
    }

    public static str(): Type {
        return new StrType();
    }

    public static string(): Type {
        return Type.primitive(PrimitiveType.String);
    }

    public static tuple(types: Type[]): Type {
        return new TupleType(types);
    }

    public static array(inner: Type, size?: number): Type {
        return new ArrayType(inner, size);
    }

    public static mutableReference(inner: Type): Type {
        return new MutableReferenceType(inner);
    }

    public static immutableReference(inner: Type): Type {
        return new ImmutableReferenceType(inner);
    }

    public static lifetime(name: string, inner: Type): Type {
        return new LifetimeType(name, inner);
    }

    public static generic(name: string, bounds?: Type[]): Type {
        return new GenericType(name, bounds);
    }

    public static trait(name: string): Type {
        return new TraitType(name);
    }

    public static closure(params: Type[], returnType: Type): Type {
        return new ClosureType(params, returnType);
    }

    public static unit(): Type {
        return new UnitType();
    }

    public static never(): Type {
        return new NeverType();
    }
}

class PrimitiveTypeNode extends Type {
    constructor(private readonly primitive: PrimitiveType) {
        super();
    }

    public write(writer: Writer): void {
        writer.write(this.primitive);
    }
}

class ReferenceType extends Type {
    constructor(private readonly reference: Reference) {
        super();
    }

    public write(writer: Writer): void {
        this.reference.write(writer);
    }
}

class OptionType extends Type {
    constructor(private readonly inner: Type) {
        super();
    }

    public write(writer: Writer): void {
        writer.write("Option<");
        this.inner.write(writer);
        writer.write(">");
    }
}

class ResultType extends Type {
    constructor(
        private readonly ok: Type,
        private readonly err: Type
    ) {
        super();
    }

    public write(writer: Writer): void {
        writer.write("Result<");
        this.ok.write(writer);
        writer.write(", ");
        this.err.write(writer);
        writer.write(">");
    }
}

class VecType extends Type {
    constructor(private readonly inner: Type) {
        super();
    }

    public write(writer: Writer): void {
        writer.write("Vec<");
        this.inner.write(writer);
        writer.write(">");
    }
}

class HashMapType extends Type {
    constructor(
        private readonly key: Type,
        private readonly value: Type
    ) {
        super();
    }

    public write(writer: Writer): void {
        writer.write("HashMap<");
        this.key.write(writer);
        writer.write(", ");
        this.value.write(writer);
        writer.write(">");
    }
}

class StrType extends Type {
    public write(writer: Writer): void {
        writer.write("&str");
    }
}

class TupleType extends Type {
    constructor(private readonly types: Type[]) {
        super();
    }

    public write(writer: Writer): void {
        writer.write("(");
        this.types.forEach((type, index) => {
            if (index > 0) {
                writer.write(", ");
            }
            type.write(writer);
        });
        writer.write(")");
    }
}

class ArrayType extends Type {
    constructor(
        private readonly inner: Type,
        private readonly size?: number
    ) {
        super();
    }

    public write(writer: Writer): void {
        writer.write("[");
        this.inner.write(writer);
        if (this.size !== undefined) {
            writer.write(`; ${this.size}`);
        }
        writer.write("]");
    }
}

class MutableReferenceType extends Type {
    constructor(private readonly inner: Type) {
        super();
    }

    public write(writer: Writer): void {
        writer.write("&mut ");
        this.inner.write(writer);
    }
}

class ImmutableReferenceType extends Type {
    constructor(private readonly inner: Type) {
        super();
    }

    public write(writer: Writer): void {
        writer.write("&");
        this.inner.write(writer);
    }
}

class LifetimeType extends Type {
    constructor(
        private readonly name: string,
        private readonly inner: Type
    ) {
        super();
    }

    public write(writer: Writer): void {
        writer.write("&'");
        writer.write(this.name);
        writer.write(" ");
        this.inner.write(writer);
    }
}

class GenericType extends Type {
    constructor(
        private readonly name: string,
        private readonly bounds?: Type[]
    ) {
        super();
    }

    public write(writer: Writer): void {
        writer.write(this.name);
        if (this.bounds && this.bounds.length > 0) {
            writer.write(": ");
            this.bounds.forEach((bound, index) => {
                if (index > 0) {
                    writer.write(" + ");
                }
                bound.write(writer);
            });
        }
    }
}

class TraitType extends Type {
    constructor(private readonly name: string) {
        super();
    }

    public write(writer: Writer): void {
        writer.write("dyn ");
        writer.write(this.name);
    }
}

class ClosureType extends Type {
    constructor(
        private readonly params: Type[],
        private readonly returnType: Type
    ) {
        super();
    }

    public write(writer: Writer): void {
        writer.write("Box<dyn Fn(");
        this.params.forEach((param, index) => {
            if (index > 0) {
                writer.write(", ");
            }
            param.write(writer);
        });
        writer.write(") -> ");
        this.returnType.write(writer);
        writer.write(">");
    }
}

class UnitType extends Type {
    public write(writer: Writer): void {
        writer.write("()");
    }
}

class NeverType extends Type {
    public write(writer: Writer): void {
        writer.write("!");
    }
}
