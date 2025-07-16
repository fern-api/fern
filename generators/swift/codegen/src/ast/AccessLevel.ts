/**
 * Swift access levels for controlling code visibility and accessibility.
 */
export const AccessLevel = {
    /**
     * Most permissive. Accessible from other modules, allows subclassing and overriding.
     */
    Open: "open",

    /**
     * Accessible from other modules, but subclassing/overriding restricted to defining module.
     */
    Public: "public",

    /**
     * Accessible within the same package.
     */
    Package: "package",

    /**
     * Default access level. Accessible within the same module only.
     */
    Internal: "internal",

    /**
     * Accessible within the same source file only.
     */
    Fileprivate: "fileprivate",

    /**
     * Most restrictive. Accessible within the enclosing declaration only.
     */
    Private: "private"
} as const

export type AccessLevel = (typeof AccessLevel)[keyof typeof AccessLevel]
