import {
    AbstractGeneratorContext,
    FernGeneratorExec,
    GeneratorNotificationService
} from "@fern-api/browser-compatible-base-generator";
import { RelativeFilePath } from "@fern-api/path-utils";
import { BaseRubyCustomConfigSchema, ruby } from "@fern-api/ruby-ast";
import { IntermediateRepresentation, TypeDeclaration, TypeId } from "@fern-fern/ir-sdk/api";
import { capitalize, snakeCase } from "lodash-es";
import { RubyTypeMapper } from "./RubyTypeMapper";

export abstract class AbstractRubyGeneratorContext<
    CustomConfig extends BaseRubyCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly ir: IntermediateRepresentation;
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

    public getFixtureNameFromIR(): string {
        return snakeCase(this.ir.apiName.pascalCase.safeName);
    }

    public getVersionFromConfig(): string | undefined {
        return this.config.output.mode._visit<string | undefined>({
            publish: (gpc) => gpc.version || undefined,
            downloadFiles: () => undefined,
            github: (gom) => gom.version || undefined,
            _other: () => undefined
        });
    }

    public getLicenseFromConfig(): string | undefined {
        return this.config.license?._visit<string | undefined>({
            basic: (l) => l.id,
            custom: (l) => l.filename,
            _other: () => undefined
        });
    }

    public getApiInfoFromIR(): {
        title?: string;
        description?: string;
        version?: string;
        license?: string | undefined;
    } {
        // Get API info from IR and config
        return {
            title: this.ir.apiName.originalName,
            version: this.getVersionFromConfig(),
            license: this.getLicenseFromConfig(),
        };
    }

    // Debug method to inspect IR and config data
    public debugIRData(): void {
        console.log('=== IR Data Debug ===');
        console.log('API Name:', this.ir.apiName);
        console.log('API Name Original:', this.ir.apiName.originalName);
        console.log('Config License:', this.config.license);
        console.log('Config Output Mode:', this.config.output.mode);
        console.log('Available IR Properties:', Object.keys(this.ir));
        console.log('=====================');
    }

    public getRootModule(): ruby.Module_ {
        return ruby.module({
            name: capitalize(this.getRootFolderName()),
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
