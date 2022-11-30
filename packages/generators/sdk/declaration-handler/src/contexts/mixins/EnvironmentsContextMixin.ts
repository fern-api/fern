import { GeneratedEnvironments } from "../../generated-types";

export interface EnvironmentsContextMixin {
    getGeneratedEnvironments: () => GeneratedEnvironments;
}

export interface WithEnvironmentsContextMixin {
    environments: EnvironmentsContextMixin;
}
