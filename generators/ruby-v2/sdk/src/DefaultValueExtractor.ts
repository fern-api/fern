import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "./SdkGeneratorContext.js";

/**
 * Represents an extracted default value with its Ruby representation.
 */
export interface ExtractedDefault {
    /** The Ruby code for the default value (e.g., "'hello'", "42", "true") */
    value: string;
    /** The Ruby type name (e.g., "String", "Integer", "Float", "Boolean") */
    rubyType: string;
}

/**
 * Utility class for extracting default values from IR type references.
 *
 * Handles:
 * - Primitive types with default values (integer, long, double, boolean, string, bigInteger)
 * - Unwrapping optional/nullable containers to find the underlying default
 * - Resolving alias types to their underlying types
 *
 * Note: Large integer values that exceed JavaScript's safe integer range (2^53 - 1)
 * are skipped because they may have lost precision during IR processing.
 */
export class DefaultValueExtractor {
    constructor(private readonly context: SdkGeneratorContext) {}

    /**
     * Extracts the default value from a FernIr.TypeReference and returns
     * a CodeBlock suitable for use as a field initializer, or undefined if
     * no default exists.
     */
    public extractDefaultCodeBlock(typeReference: FernIr.TypeReference): ruby.CodeBlock | undefined {
        const extracted = this.extractDefault(typeReference);
        if (extracted == null) {
            return undefined;
        }
        return ruby.codeblock(extracted.value);
    }

    /**
     * Returns true if the given type reference has a default value.
     */
    public hasDefault(typeReference: FernIr.TypeReference): boolean {
        return this.extractDefault(typeReference) != null;
    }

    /**
     * Extracts the default value from a FernIr.TypeReference, if one exists.
     */
    public extractDefault(typeReference: FernIr.TypeReference): ExtractedDefault | undefined {
        return typeReference._visit<ExtractedDefault | undefined>({
            primitive: (primitive) => {
                const v2 = primitive.v2;
                if (v2 == null) {
                    return undefined;
                }

                return v2._visit<ExtractedDefault | undefined>({
                    integer: (t) => (t.default != null ? { value: `${t.default}`, rubyType: "Integer" } : undefined),
                    long: (t) =>
                        t.default != null && this.isSafeInteger(t.default)
                            ? { value: `${t.default}`, rubyType: "Integer" }
                            : undefined,
                    uint: () => undefined,
                    uint64: () => undefined,
                    double: (t) =>
                        t.default != null ? { value: this.formatFloat(t.default), rubyType: "Float" } : undefined,
                    float: () => undefined,
                    boolean: (t) =>
                        t.default != null ? { value: t.default ? "true" : "false", rubyType: "Boolean" } : undefined,
                    string: (t) =>
                        t.default != null ? { value: this.escapeString(t.default), rubyType: "String" } : undefined,
                    bigInteger: (t) =>
                        t.default != null ? { value: this.escapeString(t.default), rubyType: "String" } : undefined,
                    date: () => undefined,
                    dateTime: () => undefined,
                    dateTimeRfc2822: () => undefined,
                    uuid: () => undefined,
                    base64: () => undefined,
                    _other: () => undefined
                });
            },
            container: (container) => {
                return container._visit<ExtractedDefault | undefined>({
                    optional: (inner) => this.extractDefault(inner),
                    nullable: (inner) => this.extractDefault(inner),
                    list: () => undefined,
                    set: () => undefined,
                    map: () => undefined,
                    literal: () => undefined,
                    _other: () => undefined
                });
            },
            named: (named) => {
                const typeDeclaration = this.context.getTypeDeclarationOrThrow(named.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.extractDefault(typeDeclaration.shape.aliasOf);
                }
                return undefined;
            },
            unknown: () => undefined,
            _other: () => undefined
        });
    }

    /**
     * Formats a float/double value for Ruby, ensuring it has a decimal point.
     */
    private formatFloat(value: number): string {
        const str = value.toString();
        if (!str.includes(".") && !str.includes("e") && !str.includes("E")) {
            return `${str}.0`;
        }
        return str;
    }

    /**
     * Escapes a string for use as a Ruby single-quoted string literal.
     */
    private escapeString(value: string): string {
        const escaped = value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        return `'${escaped}'`;
    }

    /**
     * Checks if a number is within JavaScript's safe integer range.
     */
    private isSafeInteger(value: number): boolean {
        return Number.isSafeInteger(value);
    }
}
