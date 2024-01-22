import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext } from "@fern-api/generator-commons";
import {
    AliasTypeDeclaration,
    EnumTypeDeclaration,
    IntermediateRepresentation,
    ObjectTypeDeclaration,
    Type,
    TypeDeclaration,
    TypeId,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import {
    generateAliasDefinitionFromTypeDeclaration,
    generateEnumDefinitionFromTypeDeclaration,
    generateSerializableObjectFromTypeDeclaration,
    generateUndiscriminatedUnionFromTypeDeclaration,
    generateUnionFromTypeDeclaration,
    getLocationForTypeDeclaration
} from "../ast/AbstractionUtilities";
import { ClassReferenceFactory } from "../ast/classes/ClassReference";
import { Module_ } from "../ast/Module_";
import { GeneratedRubyFile } from "./GeneratedRubyFile";

// TODO: This (as an abstract class) will probably be used across CLIs
export class TypesGenerator {
    private types: Map<TypeId, TypeDeclaration>;
    private gc: GeneratorContext;
    private classReferenceFactory: ClassReferenceFactory;
    private directoryPrefix: RelativeFilePath;

    // Config
    // private config: FernGeneratorExec.GeneratorConfig;
    // private customConfig: RubyModelCustomConfig;

    constructor(
        directoryPrefix: RelativeFilePath,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        this.types = new Map();
        this.gc = generatorContext;

        // this.config = config;
        // this.customConfig = customConfig;

        this.directoryPrefix = directoryPrefix;

        // For convenience just get what's inheriting what ahead of time.
        this.gc.logger.debug(`[TESTING] Found this many types: ${intermediateRepresentation.types.length}`);
        for (const type of Object.values(intermediateRepresentation.types)) {
            this.types.set(type.name.typeId, type);
        }

        this.classReferenceFactory = new ClassReferenceFactory(this.types);
    }

    private generateAliasFile(
        aliasTypeDeclaration: AliasTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const aliasExpression = generateAliasDefinitionFromTypeDeclaration(
            this.classReferenceFactory,
            aliasTypeDeclaration,
            typeDeclaration
        );
        const rootNode = Module_.wrapInModules(this.directoryPrefix, typeDeclaration.name, aliasExpression);
        const location = join(
            this.directoryPrefix,
            RelativeFilePath.of(getLocationForTypeDeclaration(typeDeclaration.name))
        );
        return new GeneratedRubyFile({ rootNode, directoryPrefix: location, entityName: typeDeclaration.name.name });
    }
    private generateEnumFile(
        enumTypeDeclaration: EnumTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const enumExpression = generateEnumDefinitionFromTypeDeclaration(enumTypeDeclaration, typeDeclaration);
        const rootNode = Module_.wrapInModules(this.directoryPrefix, typeDeclaration.name, enumExpression);
        const location = join(
            this.directoryPrefix,
            RelativeFilePath.of(getLocationForTypeDeclaration(typeDeclaration.name))
        );
        return new GeneratedRubyFile({ rootNode, directoryPrefix: location, entityName: typeDeclaration.name.name });
    }
    private generateObjectFile(
        objectTypeDeclaration: ObjectTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const serializableObject = generateSerializableObjectFromTypeDeclaration(
            this.classReferenceFactory,
            objectTypeDeclaration,
            typeDeclaration
        );
        const rootNode = Module_.wrapInModules(this.directoryPrefix, typeDeclaration.name, serializableObject);
        const location = join(
            this.directoryPrefix,
            RelativeFilePath.of(serializableObject.classReference.location ?? "")
        );
        return new GeneratedRubyFile({ rootNode, directoryPrefix: location, entityName: typeDeclaration.name.name });
    }
    private generateUnionFile(
        unionTypeDeclaration: UnionTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const unionObject = generateUnionFromTypeDeclaration(
            this.classReferenceFactory,
            unionTypeDeclaration,
            typeDeclaration
        );
        const rootNode = Module_.wrapInModules(this.directoryPrefix, typeDeclaration.name, unionObject);
        const location = join(this.directoryPrefix, RelativeFilePath.of(unionObject.classReference.location ?? ""));
        return new GeneratedRubyFile({ rootNode, directoryPrefix: location, entityName: typeDeclaration.name.name });
    }
    private generateUndiscriminatedUnionFile(
        undiscriminatedUnionTypeDeclaration: UndiscriminatedUnionTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const unionObject = generateUndiscriminatedUnionFromTypeDeclaration(
            this.classReferenceFactory,
            undiscriminatedUnionTypeDeclaration,
            typeDeclaration
        );
        const rootNode = Module_.wrapInModules(this.directoryPrefix, typeDeclaration.name, unionObject);
        const location = join(this.directoryPrefix, RelativeFilePath.of(unionObject.classReference.location ?? ""));
        return new GeneratedRubyFile({ rootNode, directoryPrefix: location, entityName: typeDeclaration.name.name });
    }
    private generateUnkownFile(shape: Type): GeneratedRubyFile | undefined {
        throw new Error("Unknown type declaration shape: " + shape.type);
    }

    public generateFiles(): Map<TypeId, GeneratedRubyFile> {
        const typeFiles = new Map<TypeId, GeneratedRubyFile>();
        for (const [key, value] of this.types.entries()) {
            // this.gc.logger.debug(`[TESTING] generating files: ${key}, ${value.name.name.pascalCase.safeName}`);

            const generatedFile = value.shape._visit<GeneratedRubyFile | undefined>({
                alias: (atd: AliasTypeDeclaration) => this.generateAliasFile(atd, value),
                enum: (etd: EnumTypeDeclaration) => this.generateEnumFile(etd, value),
                object: (otd: ObjectTypeDeclaration) => this.generateObjectFile(otd, value),
                union: (utd: UnionTypeDeclaration) => this.generateUnionFile(utd, value),
                undiscriminatedUnion: (uutd: UndiscriminatedUnionTypeDeclaration) =>
                    this.generateUndiscriminatedUnionFile(uutd, value),
                _other: () => this.generateUnkownFile(value.shape)
            });

            if (generatedFile != null) {
                typeFiles.set(key, generatedFile);
            }
        }

        return typeFiles;
    }
}
