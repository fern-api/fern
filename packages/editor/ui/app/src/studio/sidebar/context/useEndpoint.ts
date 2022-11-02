import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";

export function useEndpoint(endpointId: FernApiEditor.EndpointId): FernApiEditor.Endpoint {
    const { definition } = useApiEditorContext();
    const endpoint_ = definition.endpoints[endpointId];
    if (endpoint_ == null) {
        throw new Error("Endpoint does not exist: " + endpointId);
    }
    return endpoint_;
}
