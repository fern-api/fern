import { Reference } from "@fern-typescript/commons";
import { GeneratedEnvironments } from "./GeneratedEnvironments";

export interface EnvironmentsContext {
    getGeneratedEnvironments: () => GeneratedEnvironments;
    getReferenceToEnvironmentsEnum: () => Reference;
    getReferenceToEnvironmentUrls: () => Reference;
}
