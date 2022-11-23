import { RawSchemas } from "@fern-api/yaml-schema";
import { AbstractConvertedSchema } from "./abstractConvertedSchema";
import { AbstractConvertedType } from "./abstractConvertedType";

export class ConvertedAlias extends AbstractConvertedSchema implements AbstractConvertedType<RawSchemas.AliasSchema> {
    private aliasOf: string;

    constructor({
        id,
        tag,
        docs,
        generatedId,
        aliasOf,
    }: {
        id: string;
        tag: string;
        generatedId: boolean;
        aliasOf: string;
        docs: string | undefined;
    }) {
        super({
            id,
            tag,
            docs,
            generatedId,
        });
        this.aliasOf = aliasOf;
    }

    public toRawSchema(): RawSchemas.AliasSchema {
        return {
            docs: this.docs,
            type: this.aliasOf,
        };
    }
}
