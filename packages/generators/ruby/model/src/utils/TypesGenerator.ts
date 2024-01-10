import { IntermediateRepresentation, ObjectTypeDeclaration, Type, TypeDeclaration, TypeId } from "@fern-fern/ir-sdk/api";
import { GeneratedRubyFile } from "./GeneratedRubyFile";


// TODO: This (as an abstract class) will probably be used across CLIs
export class TypesGenerator {
    private types: Map<TypeId, TypeDeclaration>;
    // Ruby does not have a concept of interfaces directly and so we'd want to 
    // create the type/class as normal and note for the inheriting classes to
    // specify the inheritence (e.g. class InheritingClass < BaseClass)
    private typeExtends: Map<TypeId, TypeId[]>;

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        this.types = new Map();
        this.typeExtends = new Map();

        // For convenience just get what's inheriting what ahead of time.
        for (const type of Object.values(intermediateRepresentation.types)) {
            this.types.set(type.name.typeId, type);

            const extendedTypes = type.shape._visit<TypeId[]>({
                alias:  () => [],
                enum: () => [],
                object: (value: ObjectTypeDeclaration) => value.extends.map(extendedType => extendedType.typeId),
                union: () => [],
                undiscriminatedUnion: () => [],
                _other: () => []
            });
            this.typeExtends.set(type.name.typeId, extendedTypes);
        }
    }

    private generateAliasFile(typeId: TypeId, typeDeclaration: TypeDeclaration): GeneratedRubyFile | null {
        // TODO
    }
    private generateEnumFile(typeId: TypeId, typeDeclaration: TypeDeclaration): GeneratedRubyFile | null {
        // TODO
    }
    private generateObjectFile(typeId: TypeId, typeDeclaration: TypeDeclaration): GeneratedRubyFile | null {
        // TODO
    }
    private generateUnionFile(typeId: TypeId, typeDeclaration: TypeDeclaration): GeneratedRubyFile | null {
        // TODO
    }
    private generateUndiscriminatedUnionFile(typeId: TypeId, typeDeclaration: TypeDeclaration): GeneratedRubyFile | null {
        // TODO
    }
    private generateUnkownFile(shape: Type): GeneratedRubyFile | null {
        throw new Error("Unknown type declaration shape: " + shape.type);
    }

    public generateFiles(): Map<TypeId, GeneratedRubyFile> {
        const typeFiles = new Map<TypeId, GeneratedRubyFile>();

        for (const [key, value] of this.types.entries()) {
            const generatedFile = value.shape._visit<GeneratedRubyFile | null>({
                alias:  () => this.generateAliasFile(key, value),
                enum: () => this.generateEnumFile(key, value),
                object: () => this.generateObjectFile(key, value),
                union: () => this.generateUnionFile(key, value),
                undiscriminatedUnion: () => this.generateUndiscriminatedUnionFile(key, value),
                _other: () => this.generateUnkownFile(value.shape)
            });

            if (generatedFile != null) {
                typeFiles.set(key, generatedFile);
            }
        }
          
        return typeFiles;
    }
}