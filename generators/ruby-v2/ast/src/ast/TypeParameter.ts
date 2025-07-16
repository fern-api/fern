import { AbstractWriter } from "@fern-api/browser-compatible-base-generator";

import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export enum Variance {
    Invariant,
    Covariant = "out",
    Contravariant = "in"
}

export declare namespace TypeParameter {
    export interface Args {
        /* The name of the type parameter */
        name: string;
        /* If this type parameter is unchecked */
        unchecked?: boolean;
        /* What this type parameter is bound by */
        bound?: TypeParameter | Type;
        /* What the variance of this type variable is */
        variance?: Variance;
        /* A possible default type */
        defaultType?: Type;
    }
}

// TODO: Invariants, covariant, contravariant, unchecked, upper and lower bounds, default types. Some of these only
// apply to modules/classes, while others can apply to methods
// See: https://github.com/ruby/rbs/blob/master/docs/syntax.md#generics

/* A Ruby generic type parameter */
export class TypeParameter extends AstNode {
    public readonly name: string;
    public readonly unchecked: boolean;
    public readonly bound: TypeParameter | Type | undefined;
    public readonly variance: Variance;
    public readonly defaultType: Type | undefined;

    public constructor({ name, unchecked, bound, variance, defaultType }: TypeParameter.Args) {
        super();

        this.name = name;
        this.unchecked = unchecked ?? false;
        this.bound = bound;
        this.variance = variance ?? Variance.Invariant;
        this.defaultType = defaultType;
    }

    public write(_writer: Writer): void {
        // This is a no-op here, since type parameters are never printed in actual code, only in type definitions
        return;
    }

    public writeTypeDefinition(writer: Writer): void {
        if (this.unchecked) {
            writer.write("unchecked ");
        }

        if (this.variance != Variance.Invariant) {
            writer.write(`${this.variance} `);
        }

        writer.write(this.name);

        if (this.bound) {
            writer.write(" < ");
            this.bound.writeTypeDefinition(writer);
        }

        if (this.defaultType) {
            writer.write(" = ");
            this.defaultType.writeTypeDefinition(writer);
        }
    }
}
