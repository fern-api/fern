/**
 * Module augmentation for auth scheme placeholder fields added in IR v66.3.0.
 * These fields exist at runtime but are not yet reflected in the published
 * @fern-fern/ir-sdk type definitions used by this package.
 */
declare module "@fern-fern/ir-sdk/api/resources/auth/types/BearerAuthScheme" {
    interface BearerAuthScheme {
        tokenPlaceholder?: string;
    }
}

declare module "@fern-fern/ir-sdk/api/resources/auth/types/BasicAuthScheme" {
    interface BasicAuthScheme {
        usernamePlaceholder?: string;
        passwordPlaceholder?: string;
    }
}

declare module "@fern-fern/ir-sdk/api/resources/auth/types/HeaderAuthScheme" {
    interface HeaderAuthScheme {
        headerPlaceholder?: string;
    }
}
