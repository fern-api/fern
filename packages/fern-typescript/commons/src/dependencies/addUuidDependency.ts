import { DependencyManager } from "./DependencyManager";

export function addUuidDependency(dependencyManager: DependencyManager): void {
    dependencyManager.addDependency("uuid", "^8.3.2");
    dependencyManager.addDependency("@types/uuid", "^8.3.4", { dev: true });
}
