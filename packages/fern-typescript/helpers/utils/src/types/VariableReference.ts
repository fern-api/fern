import { TypeReference } from "@fern-api/api";
import { ts } from "ts-morph";

export type VariableReference = VariableReference.WireMessageBodyReference | VariableReference.ModelReference;

export declare namespace VariableReference {
    interface WireMessageBodyReference extends BaseReference {
        _type: "wireMessage";
        serviceName: string;
        endpointId: string;
        wireMessageType: "Request" | "Response" | "Error";
    }

    interface ModelReference extends BaseReference {
        _type: "modelType";
        typeReference: Exclude<TypeReference, TypeReference.Void>;
    }

    interface BaseReference {
        variable: ts.Expression;
    }
}
