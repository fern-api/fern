import { GeneratedEnvironments } from "../../generated-types";
import { Reference } from "../../Reference";

export interface EnvironmentsContextMixin {
    getGeneratedEnvironments: () => GeneratedEnvironments;
    getReferenceToEnvironmentsEnum: () => Reference;
    getReferenceToEnvironmentUrls: () => Reference;
}

export interface WithEnvironmentsContextMixin {
    environments: EnvironmentsContextMixin;
}
