import { JSONSchema4 } from "json-schema";

import { IntermediateRepresentation, TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

export class JsonSchemaConverterContext {
    private readonly buildingTypeIds: Set<TypeId> = new Set();
    private readonly definitions: Record<string, JSONSchema4> = {};

    constructor(
        private readonly context: TaskContext,
        private readonly ir: IntermediateRepresentation
    ) {}

    public getTypeDeclarationForId({ typeName, typeId }: { typeId: TypeId; typeName?: string }): TypeDeclaration {
        const typeDeclaration = this.ir.types[typeId];
        if (typeDeclaration == null) {
            if (typeName != null) {
                this.context.logger.error(`Type ${typeName} not found`);
            } else {
                // context.logger.error(`Type declaration not found for ${typeName}`);
            }
            return this.context.failAndThrow();
        }
        return typeDeclaration;
    }

    public isOptional(typeReference: TypeReference): boolean {
        if (typeReference.type === "container" && typeReference.container.type === "optional") {
            return true;
        }
        if (typeReference.type === "named") {
            const typeDeclaration = this.getTypeDeclarationForId({ typeId: typeReference.typeId });
            if (typeDeclaration.shape.type === "alias") {
                return this.isOptional(typeDeclaration.shape.aliasOf);
            }
        }
        return false;
    }

    public registerDefinition(typeId: TypeId, schema: JSONSchema4): void {
        const typeDeclaration = this.getTypeDeclarationForId({ typeId });
        this.definitions[this.getDefinitionKey(typeDeclaration)] = schema;
    }

    public getDefinitions(): Record<string, JSONSchema4> {
        return this.definitions;
    }

    public hasDefinition(typeId: TypeId): boolean {
        const typeDeclaration = this.getTypeDeclarationForId({ typeId });
        const definitionKey = this.getDefinitionKey(typeDeclaration);
        return definitionKey in this.definitions;
    }

    public getDefinitionKey(typeDeclaration: TypeDeclaration): string {
        return [
            ...typeDeclaration.name.fernFilepath.allParts.map((part) => part.originalName),
            typeDeclaration.name.name.originalName
        ].join(".");
    }

    public buildingTypeDeclaration(typeId: TypeId): void {
        this.buildingTypeIds.add(typeId);
    }

    public finishedBuildingTypeDeclaration(typeId: TypeId): void {
        this.buildingTypeIds.delete(typeId);
    }

    public isBuildingTypeDeclaration(typeId: TypeId): boolean {
        return this.buildingTypeIds.has(typeId);
    }
}
