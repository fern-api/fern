import { isTelemetryDisabled } from "./isTelemetryDisabled.js";

export interface TelemetryInitializationOptions {
    cliName: string;
    packageVersion: string;
    isLocal: boolean;
}

export function shouldInitializeTelemetry({
    cliName,
    packageVersion,
    isLocal
}: TelemetryInitializationOptions): boolean {
    if (isTelemetryDisabled() || isLocal) {
        return false;
    }

    const isLocalDev = packageVersion === "0.0.0";
    const isProductionCli = cliName === "fern" && process.env.SENTRY_ENVIRONMENT === "production";
    return !isLocalDev && isProductionCli;
}
