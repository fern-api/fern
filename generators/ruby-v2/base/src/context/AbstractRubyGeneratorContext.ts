import {
    AbstractGeneratorContext,
    FernGeneratorExec,
    GeneratorNotificationService
} from "@fern-api/browser-compatible-base-generator";
import { RubyProject } from "../project/RubyProject";
import { RelativeFilePath } from "@fern-api/path-utils";
import { BaseRubyCustomConfigSchema, ruby } from "@fern-api/ruby-ast";
import { IntermediateRepresentation, TypeDeclaration, TypeId } from "@fern-fern/ir-sdk/api";
import { capitalize, snakeCase } from "lodash-es";
import { RubyTypeMapper } from "./RubyTypeMapper";

const defaultVersion: string = "0.0.0";

export abstract class AbstractRubyGeneratorContext<
    CustomConfig extends BaseRubyCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly ir: IntermediateRepresentation;
    public readonly project: RubyProject;
    public readonly customConfig: CustomConfig;
    public readonly typeMapper: RubyTypeMapper;
    public readonly typesDirName: string = "types";
    public readonly typesModuleName: string = "Types";

    public constructor(
        ir: IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        customConfig: CustomConfig,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.ir = ir;
        this.customConfig = customConfig;
        this.typeMapper = new RubyTypeMapper(this);
        this.project = new RubyProject({ context: this });
    }

    public getTypeDeclarationOrThrow(typeId: TypeId): TypeDeclaration {
        const typeDeclaration = this.getTypeDeclaration(typeId);
        if (typeDeclaration == null) {
            throw new Error(`Type declaration with id ${typeId} not found`);
        }
        return typeDeclaration;
    }

    public getTypeDeclaration(typeId: TypeId): TypeDeclaration | undefined {
        return this.ir.types[typeId];
    }

    public getRootFolderName(): string {
        return this.customConfig.module ?? snakeCase(this.config.organization);
    }

    public getRootPackageName(): string {
        return this.ir.apiName.camelCase.safeName.toLowerCase();
    }

    public getVersionFromConfig(): string {
        return this.config.output.mode._visit<string>({
            publish: (generatorPublishConfig) => {
                if (generatorPublishConfig.version) {
                    return generatorPublishConfig.version;
                }
                this.logger.warn(
                    `Didn't define a version number as part of the publish output configuration, defaulting to ${defaultVersion}`
                );
                return defaultVersion;
            },
            downloadFiles: () => {
                this.logger.warn(
                    `File download output configuration doesn't have a configured version number, defaulting to ${defaultVersion}`
                );
                return defaultVersion;
            },
            github: (githubOutputMode) => {
                if (githubOutputMode.version) {
                    return githubOutputMode.version;
                }
                this.logger.warn(
                    `Didn't define a version number as part of the github output configuration, defaulting to ${defaultVersion}`
                );
                return defaultVersion;
            },
            _other: () => {
                this.logger.warn(`Unexpected output mode, defaulting version to ${defaultVersion}`);
                return defaultVersion;
            }
        });
    }

    public getRootModuleName(): string {
        return capitalize(this.getRootFolderName());
    }

    public getRootModule(): ruby.Module_ {
        return ruby.module({
            name: this.getRootModuleName(),
            statements: []
        });
    }

    public getModelClassReference(): ruby.ClassReference {
        return ruby.classReference({
            name: "Model",
            modules: ["Internal", "Types"]
        });
    }

    public getTypesModule(): ruby.Module_ {
        return ruby.module({
            name: "Types",
            statements: []
        });
    }

    protected snakeNames(typeDeclaration: TypeDeclaration): string[] {
        return typeDeclaration.name.fernFilepath.allParts.map((path) => path.snakeCase.safeName);
    }

    protected pascalNames(typeDeclaration: TypeDeclaration): string[] {
        return typeDeclaration.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName);
    }

    public abstract getAllTypeDeclarations(): TypeDeclaration[];

    public abstract getCoreAsIsFiles(): string[];

    public abstract getLocationForTypeId(typeId: TypeId): RelativeFilePath;

    public abstract getClassReferenceForTypeId(typeId: TypeId): ruby.ClassReference;

    public abstract getFileNameForTypeId(typeId: TypeId): string;

    public abstract getModuleNamesForTypeId(typeId: TypeId): string[];

    public abstract getModulesForTypeId(typeId: TypeId): ruby.Module_[];
}
