import { ServiceContext } from "@fern-typescript/contexts";
import { MethodDeclarationStructure, OptionalKind } from "ts-morph";

export interface GeneratedEndpointImplementation {
    getImplementation: (context: ServiceContext) => OptionalKind<MethodDeclarationStructure>;
    getDocs: (context: ServiceContext) => string | undefined;
}
