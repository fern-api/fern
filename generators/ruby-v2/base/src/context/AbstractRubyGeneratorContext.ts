import { CaseConverter } from "@fern-api/base-generator";
import {
    AbstractGeneratorContext,
    FernGeneratorExec,
    GeneratorNotificationService,
    getPackageName
} from "@fern-api/browser-compatible-base-generator";
import { RelativeFilePath } from "@fern-api/path-utils";
import { BaseRubyCustomConfigSchema, ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { upperFirst } from "lodash-es";
import { RubyProject } from "../project/RubyProject.js";
import { RubyTypeMapper } from "./RubyTypeMapper.js";

/**
 * Converts a string to snake_case for Ruby naming conventions.
 * Unlike lodash's snakeCase, this does NOT treat letter-to-number transitions as word boundaries.
 * For example: "auth0" -> "auth0" (not "auth_0"), "MyCompany" -> "my_company"
 */
function rubySnakeCase(str: string): string {
    return str
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
        .replace(/([a-z\d])([A-Z])/g, "$1_$2")
        .toLowerCase();
}

const defaultVersion: string = "0.0.0";

export abstract class AbstractRubyGeneratorContext<
    CustomConfig extends BaseRubyCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly ir: FernIr.IntermediateRepresentation;
    public readonly project: RubyProject;
    public readonly customConfig: CustomConfig;
    public readonly typeMapper: RubyTypeMapper;
    public readonly typesDirName: string = "types";
    public readonly typesModuleName: string = "Types";
    public readonly caseConverter: CaseConverter;

    public constructor(
        ir: FernIr.IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        customConfig: CustomConfig,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.ir = ir;
        this.customConfig = customConfig;
        this.caseConverter = new CaseConverter({
            generationLanguage: "ruby",
            keywords: ir.casingsConfig?.keywords,
            smartCasing: ir.casingsConfig?.smartCasing ?? true
        });
        this.typeMapper = new RubyTypeMapper(this);
        this.project = new RubyProject({ context: this });
    }

    public getTypeDeclarationOrThrow(typeId: FernIr.TypeId): FernIr.TypeDeclaration {
        const typeDeclaration = this.getTypeDeclaration(typeId);
        if (typeDeclaration == null) {
            throw new Error(`Type declaration with id ${typeId} not found`);
        }
        return typeDeclaration;
    }

    public getTypeDeclaration(typeId: FernIr.TypeId): FernIr.TypeDeclaration | undefined {
        return this.ir.types[typeId];
    }

    public getRootFolderName(): string {
        // Use custom config moduleName if set, otherwise snake_case the organization name
        // Note: packageName from publish config is NOT used here - it's only for the gemspec name
        return this.customConfig.moduleName ?? rubySnakeCase(this.config.organization);
    }

    public getGemName(): string {
        // Priority: package name from publish config > folder name
        // This is used for the gemspec spec.name and should match the exact gem name for publishing
        const packageName = getPackageName(this.config);
        return packageName ?? this.getRootFolderName();
    }

    public getRootPackageName(): string {
        return this.caseConverter.camelSafe(this.ir.apiName).toLowerCase();
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
        // Use custom config moduleName if set, otherwise upperFirst the organization name
        // Note: packageName from publish config is NOT used here - it's only for the gemspec name
        return upperFirst(this.customConfig.moduleName ?? this.config.organization);
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

    protected snakeNames(typeDeclaration: FernIr.TypeDeclaration): string[] {
        return typeDeclaration.name.fernFilepath.allParts.map((path) => this.caseConverter.snakeSafe(path));
    }

    protected pascalNames(typeDeclaration: FernIr.TypeDeclaration): string[] {
        return typeDeclaration.name.fernFilepath.allParts.map((path) => this.caseConverter.pascalSafe(path));
    }

    public abstract getAllTypeDeclarations(): FernIr.TypeDeclaration[];

    public abstract getCoreAsIsFiles(): string[];

    public abstract getLocationForTypeId(typeId: FernIr.TypeId): RelativeFilePath;

    public abstract getClassReferenceForTypeId(typeId: FernIr.TypeId): ruby.ClassReference;

    public abstract getFileNameForTypeId(typeId: FernIr.TypeId): string;

    public abstract getModuleNamesForTypeId(typeId: FernIr.TypeId): string[];

    public abstract getModulesForTypeId(typeId: FernIr.TypeId): ruby.Module_[];
}
