import { GoFile } from "@fern-api/go-base";
import { go } from "@fern-api/go-ast";

import { ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { AbstractModelGenerator } from "../AbstractModelGenerator";

export class ObjectGenerator extends AbstractModelGenerator {
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context, typeDeclaration);
    }

    protected doGenerate(): GoFile {
        const struct_ = go.struct({
            ...this.typeReference,
            docs: this.typeDeclaration.docs
        });
        const fields = this.getFields();
        struct_.addField(...fields);
        return this.toFile(struct_);
    }

    private getFields(): go.Field[] {
        const properties = this.getAllObjectProperties();
        return properties.map((property) => {
            return this.context.goFieldMapper.convert({
                name: property.name,
                reference: property.valueType,
                docs: property.docs
            });
        });
    }

    private getAllObjectProperties(): ObjectProperty[] {
        return [...(this.objectDeclaration.extendedProperties ?? []), ...this.objectDeclaration.properties];
    }
}
