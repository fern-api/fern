import { DependencyManager } from "./DependencyManager";

export function addFernServiceUtilsDependency(dependencyManager: DependencyManager): void {
    dependencyManager.addDependency("@fern-typescript/service-utils", "0.0.74");
}
