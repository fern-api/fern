import { ts } from "ts-morph";
import { GeneratedEnvironments } from "../../generated-types";
import { Reference } from "../../Reference";

export interface EnvironmentsContextMixin {
    getGeneratedEnvironments: () => GeneratedEnvironments | undefined;
    getReferenceToEnvironmentsEnum: () => Reference;
    getReferenceToDefaultEnvironment: () => ts.Expression | undefined;
}

export interface WithEnvironmentsContextMixin {
    environments: EnvironmentsContextMixin;
}
