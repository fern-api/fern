import { SdkContext } from "..";
import { GeneratedFile } from "../../commons/GeneratedFile";
import { GeneratedUnion } from "../../commons/GeneratedUnion";

export interface GeneratedEndpointErrorUnion extends GeneratedFile<SdkContext> {
    getErrorUnion: () => GeneratedUnion<SdkContext>;
}
