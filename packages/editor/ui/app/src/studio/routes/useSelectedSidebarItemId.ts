import { useCallback } from "react";
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
            navigate(
                newSidebarItemId != null
                    ? generatePath(StudioRoutes.API_EDITOR_ITEM.absolutePath, {
                          [StudioRoutes.API_EDITOR_ITEM.SIDEBAR_ITEM_ID]: newSidebarItemId,
                      })
                    : generatePath(StudioRoutes.STUDIO.absolutePath)
            );
        },
        [navigate]
    );

    const match = useMatch(StudioRoutes.API_EDITOR_ITEM.absolutePath);
    const sidebarItemId = match?.params[StudioRoutes.API_EDITOR_ITEM.SIDEBAR_ITEM_ID];

    return [sidebarItemId != null ? SidebarItemId.of(sidebarItemId) : sidebarItemId, setSidebarItemId];
}
