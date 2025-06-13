import { SdkContext } from "..";
import { GeneratedFile } from "../../commons/GeneratedFile";

export interface GeneratedSdkClientUtils extends GeneratedFile<SdkContext> {
    readonly filename: string;
    readonly outputDirectory: string;
}
