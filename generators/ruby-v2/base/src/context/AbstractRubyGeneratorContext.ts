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
    private readonly rawGeneratorInvocation: any; // Store raw data for metadata access

    public constructor(
        ir: IntermediateRepresentation,
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: CustomConfig,
        generatorNotificationService: GeneratorNotificationService,
        generatorInvocation?: any // Add generatorInvocation parameter for metadata access
    ) {
        super(config, generatorNotificationService);
        this.ir = ir;
        this.customConfig = customConfig;
        this.typeMapper = new RubyTypeMapper(this);
        
        // Store the raw generator invocation data for metadata access
        this.rawGeneratorInvocation = generatorInvocation?.raw || 
                                     (config as any).generatorInvocation?.raw || 
                                     (config as any).rawGeneratorInvocation ||
                                     null;
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

    public getMetadataLicenseFromConfig1(): string | undefined {
        // Access the metadata license from the generators.yml file
        // This method tries multiple approaches to get the metadata.license value
        
        // Approach 1: Try to access through the generator invocation if available
        const generatorInvocation = (this.config as any).generatorInvocation;
        if (generatorInvocation?.raw?.metadata?.license != null) {
            return generatorInvocation.raw.metadata.license;
        }
        if (generatorInvocation?.raw?.["metadata"]?.license != null) {
            return generatorInvocation.raw["metadata"].license;
        }
        return undefined;
    }

    public getMetadataLicenseFromConfig2(): string | undefined {
        
        // Approach 2: Try to access through the configuration directly
        const config = this.config as any;
        if (config.metadata?.license != null) {
            return config.metadata.license;
        }
        if (config["metadata"]?.license != null) {
            return config["metadata"].license;
        }
        
        return undefined;
    }
        
    public getMetadataLicenseFromConfig3(): string | undefined {
        // Approach 3: Try to access through the publishMetadata if available
        const config = this.config as any;
        if (config.publishMetadata?.license != null) {
            return config.publishMetadata.license;
        }
        
        return undefined;
    }
        
    public getMetadataLicenseFromConfig4(): string | undefined {
        // Approach 4: Try to access through the output mode if it's a GitHub output
        const config = this.config as any;
        const outputMode = config.output?.mode;
        if (outputMode?.type === "github" && outputMode.github?.license != null) {
            return outputMode.github.license;
        }
        
        return undefined;
    }

    public getMetadataLicenseFromConfig5(): string | undefined {
        // Approach 5: Try to access through the stored raw generator invocation data
        if (this.rawGeneratorInvocation?.metadata?.license != null) {
            return this.rawGeneratorInvocation.metadata.license;
        }
        if (this.rawGeneratorInvocation?.["publish-metadata"]?.license != null) {
            return this.rawGeneratorInvocation["publish-metadata"].license;
        }
        
        return undefined;
    }

    public getMetadataLicenseFromConfig6(): string | undefined {
        // Approach 6: Try to access through the generatorInvocation parameter
        // This might be available if the generatorInvocation is passed to the config
        const config = this.config as any;
        
        // Try to access the generatorInvocation parameter directly
        if (config.generatorInvocation?.raw?.metadata?.license != null) {
            return config.generatorInvocation.raw.metadata.license;
        }
        if (config.generatorInvocation?.raw?.["publish-metadata"]?.license != null) {
            return config.generatorInvocation.raw["publish-metadata"].license;
        }
        
        // Try to access through the generatorInvocation parameter that might be stored
        if (config.generatorInvocation?.metadata?.license != null) {
            return config.generatorInvocation.metadata.license;
        }
        if (config.generatorInvocation?.["publish-metadata"]?.license != null) {
            return config.generatorInvocation["publish-metadata"].license;
        }
        
        return undefined;
    }

    public debugConfigStructure(): void {
        // Debug method to log the configuration structure
        const debugInfo = {
            configKeys: Object.keys(this.config),
            configType: typeof this.config,
            config: this.config,
            rawGeneratorInvocation: this.rawGeneratorInvocation,
            rawGeneratorInvocationKeys: this.rawGeneratorInvocation ? Object.keys(this.rawGeneratorInvocation) : null,
            rawMetadata: this.rawGeneratorInvocation?.metadata,
            rawPublishMetadata: this.rawGeneratorInvocation?.["publish-metadata"],
            generatorInvocation: (this.config as any).generatorInvocation,
            publishMetadata: (this.config as any).publishMetadata,
            output: (this.config as any).output
        };

        // Also write to file for easier debugging
        try {
            const fs = require('fs');
            const path = require('path');
            const debugFile = path.join(process.cwd(), 'debug-config.json');
            fs.writeFileSync(debugFile, JSON.stringify(debugInfo, null, 2));
            console.log(`Debug info written to: ${debugFile}`);
        } catch (e) {
            console.log("Could not write debug file:", e);
        }
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
