import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractSwiftGeneratorCli, SwiftFile } from "@fern-api/swift-base";
import { generateInlinedRequestModels, generateModels } from "@fern-api/swift-model";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { RootClientGenerator, SubClientGenerator } from "./generators";

export class SdkGeneratorCLI extends AbstractSwiftGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: SdkCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): SdkGeneratorContext {
        return new SdkGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): SdkCustomConfigSchema {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return this.validateCustomConfig(parsed);
        }
        return {};
    }

    private validateCustomConfig(customConfig: SdkCustomConfigSchema): SdkCustomConfigSchema {
        return customConfig;
    }

    protected async publishPackage(_context: SdkGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.writeForDownload(context);
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        const projectFiles = await this.generateProjectFiles(context);
        context.project.addSourceFiles(...projectFiles);
        await context.project.persist();
    }

    private async generateProjectFiles(context: SdkGeneratorContext): Promise<SwiftFile[]> {
        const files: SwiftFile[] = [];

        // Core/**/*.swift and Public/**/*.swift
        // const staticFiles = await this.generateStaticFiles();
        // files.push(...staticFiles);

        // Resources/**/*.swift
        Object.entries(context.ir.subpackages).forEach(([_, subpackage]) => {
            const service = subpackage.service != null ? context.getHttpServiceOrThrow(subpackage.service) : undefined;
            const subclientGenerator = new SubClientGenerator({
                context,
                subpackage,
                serviceId: subpackage.service,
                service
            });
            files.push(subclientGenerator.generate());
        });

        // Requests/**/*.swift
        const inlinedRequestFiles = generateInlinedRequestModels({ context });
        files.push(...inlinedRequestFiles);

        // Schemas/**/*.swift
        const modelFiles = generateModels({ context });
        files.push(...modelFiles);

        // Client.swift
        const rootClientGenerator = new RootClientGenerator({
            projectNamePascalCase: context.ir.apiName.pascalCase.unsafeName,
            package_: context.ir.rootPackage,
            context
        });
        files.push(rootClientGenerator.generate());

        return files;
    }

    // private async generateStaticFiles(): Promise<SwiftFile[]> {
    //     const pathToStaticDir = resolve(__dirname, "../static");
    //     const relativeFilePathStrings = await getAllFilesInDirectoryRelative(pathToStaticDir);
    //     return Promise.all(
    //         relativeFilePathStrings.map(async (relativeFilePathString) => {
    //             const relativeFilePath = RelativeFilePath.of(relativeFilePathString);
    //             const filename = getFilename(relativeFilePath);
    //             if (filename == null) {
    //                 throw new Error(`Static file name is nullish for '${relativeFilePathString}'`);
    //             }
    //             const absoluteFilePath = resolve(pathToStaticDir, relativeFilePathString);
    //             const fileContents = await readFile(absoluteFilePath, "utf-8");
    //             return new SwiftFile({
    //                 filename,
    //                 directory: RelativeFilePath.of(dirname(relativeFilePathString)),
    //                 fileContents
    //             });
    //         })
    //     );
    // }
}
