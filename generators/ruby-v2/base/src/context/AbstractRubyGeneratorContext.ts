import {
    AbstractGeneratorContext,
    FernGeneratorExec,
    GeneratorNotificationService
} from "@fern-api/browser-compatible-base-generator";
import { RelativeFilePath } from "@fern-api/path-utils";
import { BaseRubyCustomConfigSchema, ruby } from "@fern-api/ruby-ast";
import { IntermediateRepresentation, TypeDeclaration, TypeId, TypeReference } from "@fern-fern/ir-sdk/api";
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

    public isOptional(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return true;
                }
                if (typeReference.container.type === "nullable") {
                    return this.isOptional(typeReference.container.nullable);
                }
                return false;
            case "named": {
                const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.isOptional(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            case "unknown":
                return false;
            case "primitive":
                return false;
        }
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

    public abstract getFileNameForTypeId(typeId: TypeId): string;

    public abstract getModuleNamesForTypeId(typeId: TypeId): string[];

    public abstract getModulesForTypeId(typeId: TypeId): ruby.Module_[];
}
