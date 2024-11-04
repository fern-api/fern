import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
import { IntermediateRepresentation, Name, TypeDeclaration, TypeId } from "@fern-fern/ir-sdk/api";
import { snakeCase } from "lodash-es";
import { BasePythonCustomConfigSchema } from "../custom-config/BasePythonCustomConfigSchema";
import { PythonTypeMapper } from "./PythonTypeMapper";

export abstract class AbstractPythonGeneratorContext<
    CustomConfig extends BasePythonCustomConfigSchema
> extends AbstractGeneratorContext {
    private packageName: string;
    public readonly pythonTypeMapper: PythonTypeMapper;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.packageName = snakeCase(`${this.config.organization}_${this.ir.apiName.snakeCase.unsafeName}`);
        this.pythonTypeMapper = new PythonTypeMapper(this);
    }

    public getTypeDeclarationOrThrow(typeId: TypeId): TypeDeclaration {
        const typeDeclaration = this.ir.types[typeId];
        if (typeDeclaration == null) {
            throw new Error(`Could not find type declaration for type id: ${typeId}`);
        }
        return typeDeclaration;
    }

    public getPascalCaseSafeName(name: Name): string {
        return name.pascalCase.safeName;
    }

    public getSnakeCaseSafeName(name: Name): string {
        return name.snakeCase.safeName;
    }

    public abstract getModulePathForId(typeId: TypeId): string[];
}
