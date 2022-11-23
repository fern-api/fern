import { RawSchemas } from "@fern-api/yaml-schema";
import { AbstractConvertedParameter } from "./abstractConvertedParameter";
import { AbstractConvertedType } from "./abstractConvertedType";

export class ConvertedPathParam
    extends AbstractConvertedParameter
    implements AbstractConvertedType<RawSchemas.HttpPathParameterSchema>
{
    public readonly paramName: string;

    public constructor({ paramName, type, docs }: { paramName: string; type: string; docs: string | undefined }) {
        super({ type, docs });
        this.paramName = paramName;
    }

    public toRawSchema(): RawSchemas.HttpPathParameterSchema {
        if (this.docs == null) {
            return this.type;
        }
        return {
            type: this.type,
            docs: this.docs,
        };
    }
}
