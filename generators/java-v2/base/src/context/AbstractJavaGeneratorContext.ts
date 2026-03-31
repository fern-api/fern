import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { BaseJavaCustomConfigSchema, java } from "@fern-api/java-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { JavaProject } from "../project/JavaProject.js";

import { JavaTypeMapper } from "./JavaTypeMapper.js";

export abstract class AbstractJavaGeneratorContext<
    CustomConfig extends BaseJavaCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly javaTypeMapper: JavaTypeMapper;
    public readonly project: JavaProject;

    public constructor(
        public readonly ir: FernIr.IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.javaTypeMapper = new JavaTypeMapper(this);
        this.project = new JavaProject({ context: this });
    }

    public abstract getRootPackageName(): string;

    public abstract getTypesPackageName(fernFilePath: FernIr.FernFilepath): string;

    public getJavaClassReferenceFromTypeId(typeId: FernIr.TypeId): java.ClassReference {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return this.getJavaClassReferenceFromDeclaration({ typeDeclaration });
    }

    public getJavaClassReferenceFromDeclaration({
        typeDeclaration
    }: {
        typeDeclaration: FernIr.TypeDeclaration;
    }): java.ClassReference {
        return java.classReference({
            name: typeDeclaration.name.name.pascalCase.unsafeName,
            packageName: this.getTypesPackageName(typeDeclaration.name.fernFilepath)
        });
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

    public getClassName(name: FernIr.Name): string {
        return name.pascalCase.safeName;
    }
}
