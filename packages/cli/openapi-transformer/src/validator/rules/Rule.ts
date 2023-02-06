import { RuleDefinition } from "@stoplight/spectral-core";

export interface CustomRule {
    name: string;
    validate: () => MaybePromise<RuleViolation[]>;
}

export interface SpectralRule {
    name: string;
    get: () => RuleDefinition;
}

export interface RuleViolation {
    severity: "warning" | "error";
    message: string;
    breadcrumbs: string[];
}

export type MaybePromise<T> = T | Promise<T>;
