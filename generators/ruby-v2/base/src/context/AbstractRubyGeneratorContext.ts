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

    public getTypesModule(): ruby.Module_ {
        return ruby.module({
            name: "Types",
            statements: []
        });
    }

    public getModelClassReference(): ruby.ClassReference {
        return ruby.classReference({
            name: "Model",
            modules: ["Internal", "Types"]
        });
    }

    public abstract getCoreAsIsFiles(): string[];

    public abstract getLocationForTypeId(typeId: TypeId): RelativeFilePath;
}
