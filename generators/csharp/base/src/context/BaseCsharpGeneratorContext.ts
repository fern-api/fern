import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { BaseCsharpCustomConfigSchema, CsharpGeneratorContext } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { AsIsFiles } from "../AsIs";
import { CsharpProject } from "../project";
import { CORE_DIRECTORY_NAME, PUBLIC_CORE_DIRECTORY_NAME } from "../project/CsharpProject";

export abstract class BaseCsharpGeneratorContext<
    CustomConfig extends BaseCsharpCustomConfigSchema
> extends AbstractGeneratorContext {
    public publishConfig: FernGeneratorExec.NugetGithubPublishInfo | undefined;
    public readonly project: CsharpProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        protected readonly customConfig: CustomConfig,
        generatorNotificationService: GeneratorNotificationService,
        public readonly common: CsharpGeneratorContext<CustomConfig>
    ) {
        super(config, generatorNotificationService);
        this.project = new CsharpProject({
            context: this,
            name: this.common.namespaces.root
        });

        config.output.mode._visit<void>({
            github: (github) => {
                if (github.publishInfo?.type === "nuget") {
                    this.publishConfig = github.publishInfo;
                }
            },
            publish: () => undefined,
            downloadFiles: () => undefined,
            _other: () => undefined
        });
    }

    public getCoreDirectory(): RelativeFilePath {
        return RelativeFilePath.of(CORE_DIRECTORY_NAME);
    }

    public getPublicCoreDirectory(): RelativeFilePath {
        return join(this.getCoreDirectory(), RelativeFilePath.of(PUBLIC_CORE_DIRECTORY_NAME));
    }

    public getAsIsTestUtils(): string[] {
        return Object.values(AsIsFiles.Test.Utils);
    }

    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.EditorConfig, AsIsFiles.GitIgnore];
    }

    public getAllNamespaceSegments(): Set<string> {
        return this.common.getAllNamespaceSegments();
    }

    public getAllTypeClassReferences(): Map<string, Set<string>> {
        return this.common.getAllTypeClassReferences();
    }

    public shouldCreateCustomPagination(): boolean {
        return false;
    }

    public get csharpTypeMapper() {
        return this.common.csharpTypeMapper;
    }

    public get csharpProtobufTypeMapper() {
        return this.common.csharpProtobufTypeMapper;
    }

    public get protobufResolver() {
        return this.common.protobufResolver;
    }
}
