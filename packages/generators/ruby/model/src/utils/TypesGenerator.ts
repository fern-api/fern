import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import {
    AliasTypeDeclaration,
    EnumTypeDeclaration,
    IntermediateRepresentation,
    ObjectTypeDeclaration,
    Type,
    TypeDeclaration,
    TypeId
} from "@fern-fern/ir-sdk/api";
import { camelCase, upperFirst } from "lodash-es";
import {
    generateAliasDefinitionFromTypeDeclaration,
    generateEnumDefinitionFromTypeDeclaration,
    generateSerializableObjectFromTypeDeclaration,
    getLocationForTypeDeclaration
} from "../ast/AbstractionUtilities";
import { Module_ } from "../ast/Module_";
import { RubyModelCustomConfig } from "../CustomConfig";
import { GeneratedRubyFile } from "./GeneratedRubyFile";

// TODO: This (as an abstract class) will probably be used across CLIs
export class TypesGenerator {
    private types: Map<TypeId, TypeDeclaration>;
    private gc: GeneratorContext;
    // Ruby does not have a concept of interfaces directly and so we'd want to
    // create the type/class as normal and note for the inheriting classes to
    // specify the inheritence (e.g. class InheritingClass < BaseClass)
    private typeExtends: Map<TypeId, TypeId[]>;
    private directoryPrefix: RelativeFilePath;

    // Config
    // private config: FernGeneratorExec.GeneratorConfig;
    // private customConfig: RubyModelCustomConfig;

    constructor(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        this.types = new Map();
        this.typeExtends = new Map();
        this.gc = generatorContext;

        // this.config = config;
        // this.customConfig = customConfig;

        this.directoryPrefix = RelativeFilePath.of(
            customConfig.clientClassName ?? upperFirst(camelCase(config.organization)) + "Client"
        );

        // For convenience just get what's inheriting what ahead of time.
        this.gc.logger.debug(`[TESTING] Found this many types: ${intermediateRepresentation.types.length}`);
        for (const type of Object.values(intermediateRepresentation.types)) {
            // this.gc.logger.debug(`[TESTING] adding type: ${type.name.name.camelCase.safeName}`);
            this.types.set(type.name.typeId, type);

            const extendedTypes = type.shape._visit<TypeId[]>({
                alias: () => [],
                enum: () => [],
                object: (value: ObjectTypeDeclaration) => value.extends.map((extendedType) => extendedType.typeId),
                union: () => [],
                undiscriminatedUnion: () => [],
                _other: () => []
            });
            this.typeExtends.set(type.name.typeId, extendedTypes);
        }
    }

    private generateAliasFile(
        aliasTypeDeclaration: AliasTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const aliasExpression = generateAliasDefinitionFromTypeDeclaration(aliasTypeDeclaration, typeDeclaration);
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
    // private generateUnionFile(
    //     unionTypeDeclaration: UnionTypeDeclaration,
    //     typeDeclaration: TypeDeclaration
    // ): GeneratedRubyFile | undefined {
    private generateUnionFile(): GeneratedRubyFile | undefined {
        // TODO
        return;
    }
    // private generateUndiscriminatedUnionFile(
    //     undiscriminatedUnionTypeDeclaration: UndiscriminatedUnionTypeDeclaration,
    //     typeDeclaration: TypeDeclaration
    // ): GeneratedRubyFile | undefined {
    private generateUndiscriminatedUnionFile(): GeneratedRubyFile | undefined {
        // TODO
        return;
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
                union: () => this.generateUnionFile(),
                undiscriminatedUnion: () => this.generateUndiscriminatedUnionFile(),
                _other: () => this.generateUnkownFile(value.shape)
            });

            if (generatedFile != null) {
                typeFiles.set(key, generatedFile);
            }
        }

        return typeFiles;
    }
}
