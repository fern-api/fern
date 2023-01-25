import { Reference } from "@fern-typescript/commons";
import { GeneratedEnvironments } from "../../generated-types";

export interface EnvironmentsContextMixin {
    getGeneratedEnvironments: () => GeneratedEnvironments;
    getReferenceToEnvironmentsEnum: () => Reference;
    getReferenceToEnvironmentUrls: () => Reference;
}

export interface WithEnvironmentsContextMixin {
    environments: EnvironmentsContextMixin;
}
