import { FernFernCloud } from "@fern-fern/fern-cloud-sdk";

function getEnvironment(): FernFernCloud.EnvironmentType {
    const environment = process.env.FERN_CLOUD_ENVIRONMENT;
    if (environment == null) {
        throw new Error("FERN_CLOUD_ENVIRONMENT is not defined");
    }
    switch (process.env.FERN_CLOUD_ENVIRONMENT) {
        case "DEV":
            return FernFernCloud.EnvironmentType.Dev;
        case "PROD":
            return FernFernCloud.EnvironmentType.Prod;
        default:
            throw new Error("Invalid FERN_CLOUD_ENVIRONMENT: " + process.env.FERN_CLOUD_ENVIRONMENT);
    }
}

export const ENVIRONMENT = getEnvironment();
