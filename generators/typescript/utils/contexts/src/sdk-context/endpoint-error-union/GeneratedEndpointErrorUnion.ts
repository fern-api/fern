import { GeneratedFile } from "../../commons/GeneratedFile";
import { GeneratedUnion } from "../../commons/GeneratedUnion";
import { SdkContext } from "..";

export interface GeneratedEndpointErrorUnion extends GeneratedFile<SdkContext> {
    getErrorUnion: () => GeneratedUnion<SdkContext>;
}
