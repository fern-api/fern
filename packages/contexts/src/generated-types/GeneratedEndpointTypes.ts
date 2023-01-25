import { EndpointTypesContext } from "../contexts";
import { GeneratedFile } from "./GeneratedFile";
import { GeneratedUnion } from "./GeneratedUnion";

export interface GeneratedEndpointTypes extends GeneratedFile<EndpointTypesContext> {
    getErrorUnion: () => GeneratedUnion<EndpointTypesContext>;
}
