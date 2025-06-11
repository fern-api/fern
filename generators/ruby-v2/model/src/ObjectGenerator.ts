import { Name, ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ruby } from "../../ast/src";
import { FileGenerator, RubyFile } from "../../base/src";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";
import { ModelGeneratorContext } from "./ModelGeneratorContext";

export class ObjectGenerator extends FileGenerator<RubyFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly modelGeneratorContext: ModelGeneratorContext;
    private readonly typeDeclaration: TypeDeclaration;
    private readonly object: ruby.ClassReference;
    constructor({
        context,
        typeDeclaration,
        classReference
    }: {
        context: ModelGeneratorContext;
        typeDeclaration: TypeDeclaration;
        classReference: ruby.ClassReference;
    }) {
        this.context = context;
        this.typeDeclaration = typeDeclaration;
        this.classReference = classReference;
    }

    public generateObjectFile(
        typeId: TypeId,
        objectTypeDeclaration: ObjectTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): RubyFile | undefined {
        const serializableObject = generateSerializableObjectFromTypeDeclaration(
            this.classReferenceFactory,
            this.flattenedProperties,
            typeId,
            objectTypeDeclaration,
            typeDeclaration
        );
        this.generatedClasses.set(typeId, serializableObject);
        const rootNode = Module_.wrapInModules({
            locationGenerator: this.locationGenerator,
            child: serializableObject,
            path: typeDeclaration.name.fernFilepath,
            isType: true
        });
        return new RubyFile({
            node: rootNode,
            directory: this.locationGenerator.getLocationForTypeDeclaration(typeDeclaration.name),
            filename: this.locationGenerator.getLocationForTypeDeclaration(typeDeclaration.name),
            customConfig: this.context.customConfig
        });
    }
}
