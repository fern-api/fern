import { SdkClientClassContext } from "@fern-typescript/contexts";
import { MethodDeclarationStructure, OptionalKind } from "ts-morph";

export interface GeneratedEndpointImplementation {
    getImplementation: (context: SdkClientClassContext) => OptionalKind<MethodDeclarationStructure>;
    getDocs: (context: SdkClientClassContext) => string | undefined;
}
