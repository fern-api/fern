import { AstNode } from "./AstNode";
import { Reference } from "./Reference";
import { PrimitiveType } from "./types";
import { Writer } from "./Writer";

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
    constructor(private readonly ok: Type, private readonly err: Type) {
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
    constructor(private readonly key: Type, private readonly value: Type) {
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