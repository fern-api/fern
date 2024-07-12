/**
 * An enum representing different access levels, similar to Swift's access control levels.
 * This enum can be used to define and check access permissions for various parts of a TypeScript application.
 */
export enum AccessLevel {
    /**
     * Open: Accessible and subclassable/overridable outside the module.
     * This is the highest (most permissive) access level.
     */
    Open = "open",

    /**
     * Public: Accessible outside the module but not subclassable/overridable.
     * Suitable for exposing an API to be used by other modules.
     */
    Public = "public",

    /**
     * Internal: Accessible within the same module.
     * The default access level for most parts of a module’s internal implementation.
     */
    Internal = "internal",

    /**
     * Fileprivate: Accessible within the same file.
     * Useful for encapsulating implementation details that are shared across multiple types within a file but should not be accessible from other files.
     */
    Fileprivate = "fileprivate",

    /**
     * Private: Accessible within the same enclosing declaration (class, struct, or extension) and their extensions within the same file.
     * Used for tightly encapsulating implementation details.
     */
    Private = "private"
}
