import {
    AliasTypeDeclaration,
    EnumTypeDeclaration,
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
    generateSerializableObjectFromTypeDeclaration
} from "../ast/AbstractionUtilities";
import { Module_ } from "../ast/Module_";
import { GeneratedRubyFile } from "./GeneratedRubyFile";

// TODO: This (as an abstract class) will probably be used across CLIs
export class TypesGenerator {
    private types: Map<TypeId, TypeDeclaration> = new Map();

    private generateAliasFile(
        aliasTypeDeclaration: AliasTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const aliasExpression = generateAliasDefinitionFromTypeDeclaration(aliasTypeDeclaration, typeDeclaration);
        const rootNode = Module_.wrapInModules(typeDeclaration.name, aliasExpression);
        return new GeneratedRubyFile({ rootNode, directoryPrefix: "TODO", entityName: typeDeclaration.name.name });
    }
    private generateEnumFile(
        enumTypeDeclaration: EnumTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const enumExpression = generateEnumDefinitionFromTypeDeclaration(enumTypeDeclaration, typeDeclaration);
        const rootNode = Module_.wrapInModules(typeDeclaration.name, enumExpression);
        return new GeneratedRubyFile({ rootNode, directoryPrefix: "TODO", entityName: typeDeclaration.name.name });
    }
    private generateObjectFile(
        objectTypeDeclaration: ObjectTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        const serializableObject = generateSerializableObjectFromTypeDeclaration(
            objectTypeDeclaration,
            typeDeclaration
        );
        const rootNode = Module_.wrapInModules(typeDeclaration.name, serializableObject);
        return new GeneratedRubyFile({ rootNode, directoryPrefix: "TODO", entityName: typeDeclaration.name.name });
    }
    private generateUnionFile(
        unionTypeDeclaration: UnionTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        // TODO
        return;
    }
    private generateUndiscriminatedUnionFile(
        undiscriminatedUnionTypeDeclaration: UndiscriminatedUnionTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): GeneratedRubyFile | undefined {
        // TODO
        return;
    }
    private generateUnkownFile(shape: Type): GeneratedRubyFile | undefined {
        throw new Error("Unknown type declaration shape: " + shape.type);
    }

    public generateFiles(): Map<TypeId, GeneratedRubyFile> {
        const typeFiles = new Map<TypeId, GeneratedRubyFile>();

        for (const [key, value] of this.types.entries()) {
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
