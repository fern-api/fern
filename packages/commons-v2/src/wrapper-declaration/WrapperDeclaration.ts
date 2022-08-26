import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { WrapperName } from "./WrapperName";

export interface WrapperDeclaration {
    name: WrapperName;
    wrappedServices: DeclaredServiceName[];
    wrappedWrappers: WrapperName[];
}
