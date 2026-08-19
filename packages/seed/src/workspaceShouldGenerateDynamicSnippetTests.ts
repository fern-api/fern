import { GeneratorType } from "./config/api/index.js";
import { GeneratorWorkspace } from "./loadGeneratorWorkspaces.js";

export function workspaceShouldGenerateDynamicSnippetTests(generator: GeneratorWorkspace): boolean {
    return generator.workspaceConfig.generatorType === GeneratorType.Sdk;
}
