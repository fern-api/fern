import { FernIr } from "@fern-fern/ir-sdk";
import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { FileContext } from "../file-context/FileContext.js";

export interface GeneratedVersion extends GeneratedFile<FileContext> {
    getEnumValueUnion: () => string;
    getFirstEnumValue: () => string;
    hasDefaultVersion: () => boolean;
    getDefaultVersion: () => string | undefined;
    getHeader: () => FernIr.HttpHeader;
}
