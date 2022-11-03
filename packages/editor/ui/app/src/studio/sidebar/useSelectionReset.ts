import { useEffect } from "react";
import { useApiEditorContext } from "../../api-editor-context/ApiEditorContext";
import { useSelectedSidebarItemId } from "../routes/useSelectedSidebarItemId";
import { visitSidebarItemId } from "./ids/visitSidebarItemId";

export function useSelectionReset(): void {
    const { definition } = useApiEditorContext();
    const [selectedSidebarItemId, setSelectedSidebarItemId] = useSelectedSidebarItemId();

    useEffect(() => {
        if (selectedSidebarItemId == null) {
            return;
        }
        const doesItemExist = visitSidebarItemId(selectedSidebarItemId, {
            apiConfiguration: () => true,
            sdkConfiguration: () => true,
            package: ({ packageId }) => packageId in definition.packages,
            endpoint: ({ endpointId }) => endpointId in definition.endpoints,
            type: ({ typeId }) => typeId in definition.types,
            error: ({ errorId }) => errorId in definition.errors,
            typesGroup: ({ packageId }) => packageId in definition.packages,
            errorsGroup: ({ packageId }) => packageId in definition.packages,
        });

        if (!doesItemExist) {
            setSelectedSidebarItemId(undefined);
        }
    }, [
        definition,
        definition.endpoints,
        definition.errors,
        definition.packages,
        definition.types,
        selectedSidebarItemId,
        setSelectedSidebarItemId,
    ]);
}
