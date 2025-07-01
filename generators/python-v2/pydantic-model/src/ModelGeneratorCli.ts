import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractPythonGeneratorCli, PythonDependency } from "@fern-api/python-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { PydanticModelCustomConfigSchema } from "./ModelCustomConfig";
import { PydanticModelGeneratorContext } from "./ModelGeneratorContext";
import { generateV2Models } from "./v2/generateV2Models";

export class ModelGeneratorCLI extends AbstractPythonGeneratorCli<
    PydanticModelCustomConfigSchema,
    PydanticModelGeneratorContext
> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: PydanticModelCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): PydanticModelGeneratorContext {
        return new PydanticModelGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): PydanticModelCustomConfigSchema {
        const parsed = customConfig != null ? PydanticModelCustomConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return parsed;
        }
        return {};
    }

    protected async writeForDownload(context: PydanticModelGeneratorContext): Promise<void> {
        return await this.generate(context);
    }

    protected async generate(context: PydanticModelGeneratorContext): Promise<void> {
        const files = generateV2Models({ context });
        for (const file of files) {
            context.project.addSourceFiles(file);
        }
        const dependencies = this.generateDependencies()
        for (const dependency of dependencies) {
            context.project.addDependency(dependency);
        }
        await context.project.persist();
    }

    protected publishPackage(context: PydanticModelGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected writeForGithub(context: PydanticModelGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected generateDependencies(): PythonDependency[] {
        // Include both dependencies and dev-dependencies.
        return [
            new PythonDependency("pydantic", ">=1.9.2"),
            new PythonDependency("pydantic-core", ">=2.18.2"),
            new PythonDependency("mypy", "==1.13.0", true),
            new PythonDependency("pytest", "^7.4.0", true),
            new PythonDependency("pytest-asyncio", "^0.23.5", true),
            new PythonDependency("python-dateutil", "^2.9.0", true),
            new PythonDependency("types-python-dateutil", "^2.9.0.20240316", true),
            new PythonDependency("ruff", "==0.11.5", true),
        ];
    }

}
