export function isSdkConfigInitEnabled(): boolean {
    const configured = process.env.FERN_USE_SDK_CONFIG ?? process.env.DEFAULT_USE_SDK_CONFIG ?? "false";
    return configured.trim().toLowerCase() === "true";
}
