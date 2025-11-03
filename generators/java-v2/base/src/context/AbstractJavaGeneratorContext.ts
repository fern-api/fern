import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService, File } from "@fern-api/base-generator";
import { BaseJavaCustomConfigSchema, java } from "@fern-api/java-ast";
import { JavaProject } from "../project/JavaProject";
import { FernFilepath, IntermediateRepresentation, Name, TypeDeclaration, TypeId } from "@fern-fern/ir-sdk/api";

import { JavaTypeMapper } from "./JavaTypeMapper";

export abstract class AbstractJavaGeneratorContext<
    CustomConfig extends BaseJavaCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly javaTypeMapper: JavaTypeMapper;
    public readonly project: JavaProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.javaTypeMapper = new JavaTypeMapper(this);
        this.project = new JavaProject({ context: this });
    }

    public abstract getRootPackageName(): string;

    public abstract getTypesPackageName(fernFilePath: FernFilepath): string;

    public getJavaClassReferenceFromTypeId(typeId: TypeId): java.ClassReference {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return this.getJavaClassReferenceFromDeclaration({ typeDeclaration });
    }

    public getJavaClassReferenceFromDeclaration({
        typeDeclaration
    }: {
        typeDeclaration: TypeDeclaration;
    }): java.ClassReference {
        return java.classReference({
            name: typeDeclaration.name.name.pascalCase.unsafeName,
            packageName: this.getTypesPackageName(typeDeclaration.name.fernFilepath)
        });
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

    public getClassName(name: Name): string {
        return name.pascalCase.safeName;
    }
}
