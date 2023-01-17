import { EndpointTypesContext, GeneratedEndpointTypes, GeneratedUnion } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export class NoopGeneratedEndpointTypes implements GeneratedEndpointTypes {
    public writeToFile(): void {
        // no-op
    }

    public getErrorUnion(): GeneratedUnion<EndpointTypesContext> {
        throw new Error("Cannot get error union in no-op generator");
    }

    public getReferenceToResponseType(): ts.TypeNode {
        throw new Error("Cannot get reference to response type in no-op generator");
    }
}
