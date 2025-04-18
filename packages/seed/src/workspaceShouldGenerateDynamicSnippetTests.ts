import { GeneratorType } from "./config/api";
import { GeneratorWorkspace } from "./loadGeneratorWorkspaces";

export function workspaceShouldGenerateDynamicSnippetTests(generator: GeneratorWorkspace): boolean {
    return generator.workspaceConfig.generatorType === GeneratorType.Sdk;
}
