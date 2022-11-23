import { RawSchemas } from "@fern-api/yaml-schema";
import { AbstractConvertedParameter } from "./abstractConvertedParameter";
import { AbstractConvertedType } from "./abstractConvertedType";

export class ConvertedHeader
    extends AbstractConvertedParameter
    implements AbstractConvertedType<RawSchemas.HttpHeaderSchema>
{
    public readonly headerName: string;

    public constructor({ headerName, type, docs }: { headerName: string; type: string; docs: string | undefined }) {
        super({ type, docs });
        this.headerName = headerName;
    }

    public toRawSchema(): RawSchemas.HttpHeaderSchema {
        if (this.docs == null) {
            return this.type;
        }
        return {
            type: this.type,
            docs: this.docs,
        };
    }
}
