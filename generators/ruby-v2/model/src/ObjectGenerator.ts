import { Name, ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { RelativeFilePath } from "../../../../packages/commons/fs-utils/src";
import { BaseRubyCustomConfigSchema, ruby } from "../../ast/src";
import { FileGenerator, RubyFile } from "../../base/src";
import { ModelGeneratorContext } from "./ModelGeneratorContext";

export class ObjectGenerator extends FileGenerator<RubyFile, BaseRubyCustomConfigSchema, ModelGeneratorContext> {
    private readonly context: ModelGeneratorContext;
    private readonly td: TypeDeclaration;
    private readonly otd: ObjectTypeDeclaration;

    constructor(context: ModelGeneratorContext, td: TypeDeclaration, otd: ObjectTypeDeclaration) {
        super(context);
        this.context = context;
        this.td = td;
        this.otd = otd;
    }

    public doGenerate(): RubyFile | undefined {}

    private toField({ property, inherited }: { property: ObjectProperty; inherited?: boolean }): ruby.Field {
        const convertedType = this.context.rubyTypeMapper.convert({ reference: property.valueType });
        return ruby.field({
            name: property.name.name,
            type: convertedType,
            docs: property.docs,
            inherited
        });
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.td.name.typeId).directory;
    }
}
