import { GeneratedEnvironments } from "../../generated-types";
import { Reference } from "../../Reference";

export interface EnvironmentsContextMixin {
    getGeneratedEnvironments: () => GeneratedEnvironments | undefined;
    getReferenceToEnvironmentsEnum: () => Reference;
}

export interface WithEnvironmentsContextMixin {
    environments: EnvironmentsContextMixin;
}
