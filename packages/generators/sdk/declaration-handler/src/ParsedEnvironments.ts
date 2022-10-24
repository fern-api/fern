import { ts } from "ts-morph";
import { Reference } from "./Reference";

export interface ParsedEnvironments {
    getReferenceToEnvironmentEnum: () => Reference;
    getReferenceToDefaultEnvironment: (() => ts.Expression) | undefined;
}
