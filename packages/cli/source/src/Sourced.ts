import type { Locatable } from "./Locatable";
import type { SourceLocation } from "./SourceLocation";

/**
 * The Sourced type wraps any value with source location tracking.
 */
export type Sourced<T> = T extends string
    ? SourcedString
    : T extends number
      ? SourcedNumber
      : T extends boolean
        ? SourcedBoolean
        : T extends null
          ? SourcedNullish<null>
          : T extends undefined
            ? SourcedNullish<undefined>
            : T extends Array<infer U>
              ? SourcedArray<U>
              : T extends object
                ? SourcedObject<T>
                : never;

/**
 * A sourced string constrained to a specific set of literal values.
 * Useful for enums in YAML.
 */
export type SourcedLiteral<T extends string> = SourcedString & {
    readonly value: T;
};

/**
 * A primitive value with source location tracking.
 * Use `valueOf()` for implicit conversion, or `.value` for explicit access.
 */
export class SourcedString implements Locatable {
    constructor(
        private readonly _value: string,
        public readonly $loc: SourceLocation
    ) {}

    public get value(): string {
        return this._value;
    }

    public get length(): number {
        return this._value.length;
    }

    public valueOf(): string {
        return this._value;
    }

    public toString(): string {
        return this._value;
    }

    public toLowerCase(): string {
        return this._value.toLowerCase();
    }

    public toUpperCase(): string {
        return this._value.toUpperCase();
    }

    public trim(): string {
        return this._value.trim();
    }

    public startsWith(searchString: string, position?: number): boolean {
        return this._value.startsWith(searchString, position);
    }

    public endsWith(searchString: string, endPosition?: number): boolean {
        return this._value.endsWith(searchString, endPosition);
    }

    public includes(searchString: string, position?: number): boolean {
        return this._value.includes(searchString, position);
    }

    public split(separator: string | RegExp, limit?: number): string[] {
        return this._value.split(separator, limit);
    }
}

export class SourcedNumber implements Locatable {
    constructor(
        private readonly _value: number,
        public readonly $loc: SourceLocation
    ) {}

    public get value(): number {
        return this._value;
    }

    public valueOf(): number {
        return this._value;
    }

    public toString(): string {
        return String(this._value);
    }

    public toFixed(fractionDigits?: number): string {
        return this._value.toFixed(fractionDigits);
    }
}

export class SourcedBoolean implements Locatable {
    constructor(
        private readonly _value: boolean,
        public readonly $loc: SourceLocation
    ) {}

    public get value(): boolean {
        return this._value;
    }

    public valueOf(): boolean {
        return this._value;
    }

    public toString(): string {
        return String(this._value);
    }
}

/**
 * A null/undefined value with source location tracking.
 */
export class SourcedNullish<T extends null | undefined> implements Locatable {
    constructor(
        private readonly _value: T,
        public readonly $loc: SourceLocation
    ) {}

    public get value(): T {
        return this._value;
    }

    public valueOf(): T {
        return this._value;
    }
}

/**
 * An object with source location tracking.
 */
export type SourcedObject<T extends object> = {
    [K in keyof T]: Sourced<T[K]>;
} & Locatable;

/**
 * An array of elements with source location tracking.
 */
export type SourcedArray<T> = Array<Sourced<T>> & Locatable;
