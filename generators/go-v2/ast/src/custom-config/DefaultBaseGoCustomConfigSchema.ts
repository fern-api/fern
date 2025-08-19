import { BaseGoCustomConfigSchema } from "./BaseGoCustomConfigSchema";

export const defaultBaseGoCustomConfigSchema: BaseGoCustomConfigSchema = {
    alwaysSendRequiredProperties: true,
    inlinePathParameters: true,
    inlineFileProperties: true,
    useReaderForBytesRequest: true,
    union: "v1"
};
