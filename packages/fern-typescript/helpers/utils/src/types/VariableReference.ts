import { EndpointId } from "@fern-fern/ir-model/services/http";
import { TypeReference } from "@fern-fern/ir-model/types";
import { ts } from "ts-morph";

export type VariableReference = VariableReference.WireMessageBodyReference | VariableReference.ModelReference;

export declare namespace VariableReference {
    interface WireMessageBodyReference extends BaseReference {
        _type: "wireMessage";
        serviceName: string;
        endpointId: EndpointId;
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
