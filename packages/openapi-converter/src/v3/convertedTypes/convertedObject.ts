import { RawSchemas } from "@fern-api/yaml-schema";
import { mapValues } from "lodash-es";
import { AbstractConvertedSchema } from "./abstractConvertedSchema";
import { AbstractConvertedType } from "./abstractConvertedType";

export class ConvertedObject extends AbstractConvertedSchema implements AbstractConvertedType<RawSchemas.ObjectSchema> {
    public properties: Record<string, ConvertedProperty> = {};

    constructor({
        id,
        tag,
        docs,
        generatedId,
    }: {
        id: string;
        tag: string;
        generatedId: boolean;
        docs: string | undefined;
    }) {
        super({
            id,
            tag,
            docs,
            generatedId,
        });
    }

    public addProperty(wireKey: string, convetedProperty: ConvertedProperty): void {
        this.properties[wireKey] = convetedProperty;
    }

    public toRawSchema(): RawSchemas.ObjectSchema {
        return {
            docs: this.docs,
            properties: mapValues(this.properties, (convertedProperty) => convertedProperty.toRawSchema()),
        };
    }
}

export class ConvertedProperty implements AbstractConvertedType<RawSchemas.ObjectPropertySchema> {
    public readonly docs: string | undefined;
    public readonly type: string;

    public constructor({ type, docs }: { type: string; docs: string | undefined }) {
        this.docs = docs;
        this.type = type;
    }

    public toRawSchema(): RawSchemas.ObjectPropertySchema {
        if (this.docs == null) {
            return this.type;
        }
        return {
            docs: this.docs,
            type: this.type,
        };
    }
}
