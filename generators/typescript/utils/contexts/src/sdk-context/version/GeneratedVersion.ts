import { HttpHeader } from "@fern-fern/ir-sdk/api";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { SdkContext } from "../SdkContext.js";

export interface GeneratedVersion extends GeneratedFile<SdkContext> {
    getEnumValueUnion: () => string;
    getFirstEnumValue: () => string;
    hasDefaultVersion: () => boolean;
    getDefaultVersion: () => string | undefined;
    getHeader: () => HttpHeader;
}
