import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { GeneratedUnion } from "../../commons/GeneratedUnion.js";
import { SdkContext } from "../index.js";

export interface GeneratedEndpointErrorUnion extends GeneratedFile<SdkContext> {
    getErrorUnion: () => GeneratedUnion<SdkContext>;
}
