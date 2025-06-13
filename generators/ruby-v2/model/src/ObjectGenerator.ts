import { ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { RelativeFilePath } from "../../../../packages/commons/fs-utils/src";
import { BaseRubyCustomConfigSchema, ruby } from "../../ast/src";
import { Field } from "../../ast/src/ast";
import { FileGenerator, RubyFile } from "../../base/src";
import { ModelGeneratorContext } from "./ModelGeneratorContext";

export class ObjectGenerator extends FileGenerator<RubyFile, BaseRubyCustomConfigSchema, ModelGeneratorContext> {
    protected readonly context: ModelGeneratorContext;
    private readonly td: TypeDeclaration;
    private readonly otd: ObjectTypeDeclaration;

    constructor(context: ModelGeneratorContext, td: TypeDeclaration, otd: ObjectTypeDeclaration) {
        super(context);
        this.context = context;
        this.td = td;
        this.otd = otd;
    }

    public doGenerate(): RubyFile {
        const klass = ruby.object_({
            name: this.td.name.name.pascalCase.safeName,
            fields: []
        });

        for (const property of this.otd.properties) {
            const field = this.toField({ property });
            klass.addField(field);
        }

        return new RubyFile({
            node: klass,
            filename: `${klass.name}.rb`,
            directory: this.getFilepath(),
            customConfig: this.context.customConfig
        });
    }

    private toField({ property }: { property: ObjectProperty }): Field {
        return ruby.field({
            name: property.name.name.snakeCase.safeName,
            type: property.valueType
        });
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.td.name.typeId).directory;
    }
}
