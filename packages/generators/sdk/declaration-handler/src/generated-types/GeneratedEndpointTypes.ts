import { EndpointTypesContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";
import { GeneratedUnion } from "./GeneratedUnion";

export interface GeneratedEndpointTypes extends BaseGenerated<EndpointTypesContext> {
    getErrorUnion: () => GeneratedUnion<EndpointTypesContext>;
}
