import { assertNever } from "@fern-api/core-utils";
import { useCallback, useMemo } from "react";
import { generatePath, useMatch, useNavigate } from "react-router-dom";
import { StudioRoutes } from ".";
import { SidebarItemId } from "../sidebar/ids/SidebarItemId";

export function useSelectedSidebarItemId(): [
    SidebarItemId | undefined,
    (sidebarItemId: SidebarItemId | undefined) => void
] {
    const navigate = useNavigate();
    const setSidebarItemId = useCallback(
        (newSidebarItemId: SidebarItemId | undefined) => {
            const path =
                newSidebarItemId != null
                    ? generatePathForStudioItemId(newSidebarItemId)
                    : generatePath(StudioRoutes.STUDIO.absolutePath);
            navigate(path);
        },
        [navigate]
    );

    const apiConfigurationMatch = useMatch(StudioRoutes.API_CONFIGURATION.absolutePath);
    const sdkConfigurationMatch = useMatch(StudioRoutes.SDK_CONFIGURATION.absolutePath);
    const editorItemMatch = useMatch(StudioRoutes.API_EDITOR_ITEM.absolutePath);
    const typesGroupMatch = useMatch(StudioRoutes.API_EDITOR_TYPES_GROUP.absolutePath);
    const errorsGroupMatch = useMatch(StudioRoutes.API_EDITOR_ERRORS_GROUP.absolutePath);

    const sidebarItemId = useMemo((): SidebarItemId | undefined => {
        if (apiConfigurationMatch != null) {
            return { type: "apiConfiguration" };
        }
        if (sdkConfigurationMatch != null) {
            return { type: "sdkConfiguration" };
        }
        if (editorItemMatch != null && editorItemMatch.params.EDITOR_ITEM_ID != null) {
            return {
                type: "editorItem",
                editorItemId: editorItemMatch.params.EDITOR_ITEM_ID,
            };
        }
        if (typesGroupMatch != null && typesGroupMatch.params.EDITOR_ITEM_ID != null) {
            return {
                type: "editorTypesGroup",
                packageId: typesGroupMatch.params.EDITOR_ITEM_ID,
            };
        }
        if (errorsGroupMatch != null && errorsGroupMatch.params.EDITOR_ITEM_ID != null) {
            return {
                type: "editorErrorsGroup",
                packageId: errorsGroupMatch.params.EDITOR_ITEM_ID,
            };
        }
        return undefined;
    }, [apiConfigurationMatch, editorItemMatch, errorsGroupMatch, sdkConfigurationMatch, typesGroupMatch]);

    return [sidebarItemId, setSidebarItemId];
}

function generatePathForStudioItemId(sidebarItemId: SidebarItemId): string {
    switch (sidebarItemId.type) {
        case "apiConfiguration":
            return StudioRoutes.API_CONFIGURATION.absolutePath;
        case "sdkConfiguration":
            return StudioRoutes.SDK_CONFIGURATION.absolutePath;
        case "editorItem":
            return generatePath(StudioRoutes.API_EDITOR_ITEM.absolutePath, {
                [StudioRoutes.API_EDITOR_ITEM.parameters.EDITOR_ITEM_ID]: sidebarItemId.editorItemId,
            });
        case "editorTypesGroup":
            return generatePath(StudioRoutes.API_EDITOR_TYPES_GROUP.absolutePath, {
                [StudioRoutes.API_EDITOR_TYPES_GROUP.parameters.EDITOR_ITEM_ID]: sidebarItemId.packageId,
            });
        case "editorErrorsGroup":
            return generatePath(StudioRoutes.API_EDITOR_ERRORS_GROUP.absolutePath, {
                [StudioRoutes.API_EDITOR_ERRORS_GROUP.parameters.EDITOR_ITEM_ID]: sidebarItemId.packageId,
            });
        default:
            assertNever(sidebarItemId);
    }
}
