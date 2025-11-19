import { Literal } from "../code/Literal";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";

export interface Type extends AstNode {
    /**
     * Gets the multipart form method name used when this type is added to a multipart/form-data request.
     */
    readonly multipartMethodName: string | null;

    /**
     * Gets the multipart form method name used when a collection of this type is added to a multipart/form-data request.
     */
    readonly multipartMethodNameForCollection: string | null;

    /**
     * The fully qualified name of this type.
     */
    readonly fullyQualifiedName: string;

    /**
     * Indicates whether this type is a reference type (true), value type (false), or indeterminate (undefined).
     */
    readonly isReferenceType: boolean | undefined;

    /**
     * Indicates whether this type represents a collection (List, Set, Map, etc.).
     */
    readonly isCollection: boolean;

    /**
     * Indicates whether this type is optional (nullable).
     */
    readonly isOptional: boolean;

    /**
     * Returns a new type that is the optional version of this type.
     * If the type is already optional, returns the same type unchanged.
     */
    asOptional(): Type;

    /**
     * Returns a new type that is the non-optional version of this type.
     * If the type is already non-optional, returns the same type unchanged.
     */
    asNonOptional(): Type;

    /**
     * The default value for this type (e.g., null for reference types, 0 for integers, etc.).
     */
    readonly defaultValue: Literal;

    /**
     * Writes this type to the provided writer.
     */
    write(writer: Writer): void;
}
