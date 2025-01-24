import { snakeCase } from "lodash-es";

import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";

import { IntermediateRepresentation, Name, TypeDeclaration, TypeId, TypeReference } from "@fern-fern/ir-sdk/api";

import { BasePythonCustomConfigSchema } from "../custom-config/BasePythonCustomConfigSchema";
import { PythonProject } from "../project";
import { PythonTypeMapper } from "./PythonTypeMapper";

export abstract class AbstractPythonGeneratorContext<
    CustomConfig extends BasePythonCustomConfigSchema
> extends AbstractGeneratorContext {
    private packageName: string;
    public readonly pythonTypeMapper: PythonTypeMapper;
    public readonly project: PythonProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.packageName = snakeCase(`${this.config.organization}_${this.ir.apiName.snakeCase.unsafeName}`);
        this.pythonTypeMapper = new PythonTypeMapper(this);
        this.project = new PythonProject({ context: this });
    }

    public getTypeDeclarationOrThrow(typeId: TypeId): TypeDeclaration {
        const typeDeclaration = this.ir.types[typeId];
        if (typeDeclaration == null) {
            throw new Error(`Could not find type declaration for type id: ${typeId}`);
        }
        return typeDeclaration;
    }

    public isTypeReferenceOptional(typeReference: TypeReference): boolean {
        if (typeReference.type === "container" && typeReference.container.type === "optional") {
            return true;
        }
        if (typeReference.type === "named") {
            const typeDeclaration = this.getTypeDeclarationOrThrow(typeReference.typeId);
            if (typeDeclaration.shape.type === "alias") {
                return this.isTypeReferenceOptional(typeDeclaration.shape.aliasOf);
            }
        }
        return false;
    }

    public getClassName(name: Name): string {
        return name.pascalCase.safeName;
    }

    public getPascalCaseSafeName(name: Name): string {
        return name.pascalCase.safeName;
    }

    public getSnakeCaseSafeName(name: Name): string {
        return name.snakeCase.safeName;
    }

    public abstract getModulePathForId(typeId: TypeId): string[];
}
