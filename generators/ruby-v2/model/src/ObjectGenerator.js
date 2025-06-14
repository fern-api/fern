import { ruby } from "../../ast/src";
import { FileGenerator, RubyFile } from "../../base/src";
export class ObjectGenerator extends FileGenerator {
    context;
    td;
    otd;
    constructor(context, td, otd) {
        super(context);
        this.context = context;
        this.td = td;
        this.otd = otd;
    }
    doGenerate() {
        const klass = ruby.object_({
            ...this.td.name,
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
    toField({ property, optional }) {
        return ruby.field({
            name: property.name.name,
            type: property.valueType,
            optional
        });
    }
    getFilepath() {
        return this.context.getLocationForTypeId(this.td.name.typeId).directory;
    }
}
