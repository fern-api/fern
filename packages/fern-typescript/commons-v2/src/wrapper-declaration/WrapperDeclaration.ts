import { ServiceName } from "@fern-fern/ir-model/services";
import { WrapperName } from "./WrapperName";

export interface WrapperDeclaration {
    name: WrapperName;
    wrappedServices: ServiceName[];
    wrappedWrappers: WrapperName[];
}
