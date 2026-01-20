import { TypeReference } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "./SdkGeneratorContext";

/**
 * Represents an extracted default value with its C# representation
 */
export interface ExtractedDefault {
    /** The C# code for the default value (e.g., '"node22"', '42', 'true') */
    value: string;
    /** The C# type name (e.g., 'string', 'int', 'bool') */
    csharpType: string;
    /** Whether the value can be used as a const (true for primitives except BigInteger) */
    isConst: boolean;
}

/**
 * Utility class for extracting default values from IR type references.
 *
 * This class handles:
 * - Primitive types with default values (int, long, double, float, bool, string, uint, ulong, BigInteger)
 * - Unwrapping optional/nullable containers to find the underlying default
 * - Resolving alias types to their underlying types
 *
 * Note: Large integer values that exceed JavaScript's safe integer range (2^53 - 1)
 * are skipped because they may have lost precision during IR processing.
 */
export class DefaultValueExtractor {
    constructor(private readonly context: SdkGeneratorContext) {}

    /**
     * Extracts the default value from a TypeReference, if one exists.
     *
     * @param typeReference - The type reference to extract the default from
     * @returns The extracted default with its C# representation, or undefined if no default exists
     */
    public extractDefault(typeReference: TypeReference): ExtractedDefault | undefined {
        return typeReference._visit<ExtractedDefault | undefined>({
            primitive: (primitive) => {
                const v2 = primitive.v2;
                if (v2 == null) {
                    return undefined;
                }

                return v2._visit<ExtractedDefault | undefined>({
                    integer: (t) =>
                        t.default != null
                            ? { value: `${t.default}`, csharpType: "int", isConst: true }
                            : undefined,
                    long: (t) =>
                        // Skip large values that may have lost precision in JavaScript
                        t.default != null && this.isSafeInteger(t.default)
                            ? { value: `${t.default}L`, csharpType: "long", isConst: true }
                            : undefined,
                    double: (t) =>
                        t.default != null
                            ? { value: this.formatDouble(t.default), csharpType: "double", isConst: true }
                            : undefined,
                    boolean: (t) =>
                        t.default != null
                            ? { value: t.default ? "true" : "false", csharpType: "bool", isConst: true }
                            : undefined,
                    string: (t) =>
                        t.default != null
                            ? { value: this.escapeString(t.default), csharpType: "string", isConst: true }
                            : undefined,
                    bigInteger: (t) =>
                        t.default != null
                            ? {
                                  value: `BigInteger.Parse("${t.default}")`,
                                  csharpType: "BigInteger",
                                  isConst: false
                              }
                            : undefined,
                    // Types not yet supported in IR SDK for defaults
                    float: () => undefined,
                    uint: () => undefined,
                    uint64: () => undefined,
                    // Other primitive types don't support defaults
                    date: () => undefined,
                    dateTime: () => undefined,
                    uuid: () => undefined,
                    base64: () => undefined,
                    _other: () => undefined
                });
            },
            container: (container) => {
                return container._visit<ExtractedDefault | undefined>({
                    optional: (inner) => this.extractDefault(inner),
                    nullable: (inner) => this.extractDefault(inner),
                    // Other containers don't have defaults
                    list: () => undefined,
                    set: () => undefined,
                    map: () => undefined,
                    literal: () => undefined,
                    _other: () => undefined
                });
            },
            named: (named) => {
                // Resolve alias types to their underlying type
                const typeDeclaration = this.context.model.dereferenceType(named.typeId).typeDeclaration;
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
     * Formats a double value for C# code, ensuring it has a decimal point.
     */
    private formatDouble(value: number): string {
        const str = value.toString();
        // If the number doesn't have a decimal point, add .0
        if (!str.includes(".") && !str.includes("e") && !str.includes("E")) {
            return `${str}.0`;
        }
        return str;
    }

    /**
     * Escapes a string for use in C# code.
     */
    private escapeString(value: string): string {
        const escaped = value
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t");
        return `"${escaped}"`;
    }

    /**
     * Checks if a number is within JavaScript's safe integer range.
     * Values outside this range (±2^53 - 1) may have lost precision during IR processing.
     */
    private isSafeInteger(value: number): boolean {
        return Number.isSafeInteger(value);
    }
}
