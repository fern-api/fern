export function isAuthProvider(value) {
    return (typeof value === "object" &&
        value !== null &&
        "getAuthRequest" in value &&
        typeof value.getAuthRequest === "function");
}
