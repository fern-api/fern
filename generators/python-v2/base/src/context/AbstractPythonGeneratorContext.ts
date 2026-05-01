import {
    AbstractGeneratorContext,
    CaseConverter,
    FernGeneratorExec,
    GeneratorNotificationService
} from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { snakeCase } from "lodash-es";

import { BasePythonCustomConfigSchema } from "../custom-config/BasePythonCustomConfigSchema.js";
import { PythonProject } from "../project/index.js";
import { PythonTypeMapper } from "./PythonTypeMapper.js";

export abstract class AbstractPythonGeneratorContext<
    CustomConfig extends BasePythonCustomConfigSchema
> extends AbstractGeneratorContext {
    private packageName: string;
    public readonly pythonTypeMapper: PythonTypeMapper;
    public readonly project: PythonProject;
    /**
     * Case converter configured from the IR's casingsConfig (driven by the customer's
     * `smart-casing` flag in generators.yml). Generated names must use this so they
     * match the IR server's pre-computed snake_case values.
     */
    public readonly caseConverter: CaseConverter;

    public constructor(
        public readonly ir: FernIr.IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.caseConverter = new CaseConverter({
            generationLanguage: "python",
            keywords: undefined,
            smartCasing: this.ir.casingsConfig?.smartCasing ?? true
        });
        this.packageName = snakeCase(`${this.config.organization}_${this.caseConverter.snakeUnsafe(this.ir.apiName)}`);
        this.pythonTypeMapper = new PythonTypeMapper(this);
        this.project = new PythonProject({ context: this });
    }

    public getTypeDeclarationOrThrow(typeId: FernIr.TypeId): FernIr.TypeDeclaration {
        const typeDeclaration = this.ir.types[typeId];
        if (typeDeclaration == null) {
            throw new Error(`Could not find type declaration for type id: ${typeId}`);
        }
        return typeDeclaration;
    }

    public isTypeReferenceOptional(typeReference: FernIr.TypeReference): boolean {
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

    public getClassName(name: FernIr.NameOrString): string {
        return this.caseConverter.pascalSafe(name);
    }

    public getPascalCaseSafeName(name: FernIr.NameOrString): string {
        return this.caseConverter.pascalSafe(name);
    }

    public getSnakeCaseSafeName(name: FernIr.NameOrString): string {
        return this.caseConverter.snakeSafe(name);
    }

    public getModulePathForId(typeId: string): string[] {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        const fernFilepath = typeDeclaration.name.fernFilepath;
        return [...fernFilepath.allParts.flatMap((part) => ["resources", this.getSnakeCaseSafeName(part)]), "types"];
    }

    public abstract getRawAsIsFiles(): string[];
}
