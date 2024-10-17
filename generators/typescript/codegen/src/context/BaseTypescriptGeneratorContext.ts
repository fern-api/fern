import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import { IntermediateRepresentation, TypeDeclaration, TypeId } from "@fern-fern/ir-sdk/api";
import { camelCase, upperFirst } from "lodash-es";
import { BaseTypescriptCustomConfigSchema } from "../custom-config/BaseTypescriptCustomConfigSchema";
import { TypescriptTypeMapper } from "./TypescriptTypeMapper";

export class BaseTypescriptGeneratorContext<
    CustomConfig extends BaseTypescriptCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly tsTypeMapper: TypescriptTypeMapper;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.tsTypeMapper = new TypescriptTypeMapper(this);
    }

    public getNamespaceExport(): string {
        if (this.customConfig.namespaceExport != null) {
            return this.customConfig.namespaceExport;
        }
        return `${upperFirst(camelCase(this.config.organization))}${upperFirst(camelCase(this.config.workspaceName))}`;
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
}
