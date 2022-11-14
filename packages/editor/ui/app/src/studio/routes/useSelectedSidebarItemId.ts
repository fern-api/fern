import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback, useMemo } from "react";
import { generatePath, useMatch, useNavigate } from "react-router-dom";
import { StudioRoutes } from ".";
import { useApiEditorContext } from "../../api-editor-context/ApiEditorContext";
import { SidebarItemId } from "../sidebar/ids/SidebarItemId";
import { visitSidebarItemId } from "../sidebar/ids/visitSidebarItemId";
import { addHumanReadablePrefixToId, removeHumanReadablePrefixFromId } from "./humanReadableId";

export function useSelectedSidebarItemId(): [
    SidebarItemId | undefined,
    (sidebarItemId: SidebarItemId | undefined, opts?: { replace?: boolean }) => void
] {
    const navigate = useNavigate();
    const setSidebarItemId = useCallback(
        (newSidebarItemId: SidebarItemId | undefined, { replace = false }: { replace?: boolean } = {}) => {
            const path =
                newSidebarItemId != null
                    ? generatePathForStudioItemId(newSidebarItemId)
                    : generatePath(StudioRoutes.STUDIO.absolutePath);
            navigate(path, { replace });
        },
        [navigate]
    );

    const apiConfigurationMatch = useMatch(StudioRoutes.API_CONFIGURATION.absolutePath);
    const sdkConfigurationMatch = useMatch(StudioRoutes.SDK_CONFIGURATION.absolutePath);
    const editorItemMatch = useMatch(StudioRoutes.API_EDITOR_ITEM.absolutePath);
    const typesGroupMatch = useMatch(StudioRoutes.TYPES_GROUP.absolutePath);
    const errorsGroupMatch = useMatch(StudioRoutes.ERRORS_GROUP.absolutePath);

    const { definition } = useApiEditorContext();

    const sidebarItemId = useMemo((): SidebarItemId | undefined => {
        if (apiConfigurationMatch != null) {
            return { type: "apiConfiguration" };
        }
        if (sdkConfigurationMatch != null) {
            return { type: "sdkConfiguration" };
        }
        if (editorItemMatch != null && editorItemMatch.params.EDITOR_ITEM_ID != null) {
            const editorItemId = removeHumanReadablePrefixFromId(editorItemMatch.params.EDITOR_ITEM_ID);
            if (editorItemId in definition.packages) {
                return {
                    type: "package",
                    packageId: editorItemId as FernApiEditor.PackageId,
                };
            }
            if (editorItemId in definition.endpoints) {
                return {
                    type: "endpoint",
                    endpointId: editorItemId as FernApiEditor.EndpointId,
                };
            }
            if (editorItemId in definition.types) {
                return {
                    type: "type",
                    typeId: editorItemId as FernApiEditor.TypeId,
                };
            }
            if (editorItemId in definition.errors) {
                return {
                    type: "error",
                    errorId: editorItemId as FernApiEditor.ErrorId,
                };
            }
            return {
                type: "unknown",
                uuidInUrl: editorItemId,
            };
        }
        if (typesGroupMatch != null && typesGroupMatch.params.EDITOR_ITEM_ID != null) {
            return {
                type: "typesGroup",
                packageId: removeHumanReadablePrefixFromId(
                    typesGroupMatch.params.EDITOR_ITEM_ID
                ) as FernApiEditor.PackageId,
            };
        }
        if (errorsGroupMatch != null && errorsGroupMatch.params.EDITOR_ITEM_ID != null) {
            return {
                type: "errorsGroup",
                packageId: removeHumanReadablePrefixFromId(
                    errorsGroupMatch.params.EDITOR_ITEM_ID
                ) as FernApiEditor.PackageId,
            };
        }
        return undefined;
    }, [
        apiConfigurationMatch,
        definition.endpoints,
        definition.errors,
        definition.packages,
        definition.types,
        editorItemMatch,
        errorsGroupMatch,
        sdkConfigurationMatch,
        typesGroupMatch,
    ]);

    return [sidebarItemId, setSidebarItemId];
}

function generatePathForStudioItemId(sidebarItemId: SidebarItemId): string {
    return visitSidebarItemId(sidebarItemId, {
        apiConfiguration: () => StudioRoutes.API_CONFIGURATION.absolutePath,
        sdkConfiguration: () => StudioRoutes.SDK_CONFIGURATION.absolutePath,
        package: ({ packageId, packageName }) =>
            generatePath(StudioRoutes.API_EDITOR_ITEM.absolutePath, {
                EDITOR_ITEM_ID: addHumanReadablePrefixToId({ id: packageId, humanReadablePrefix: packageName }),
            }),
        endpoint: ({ endpointId, endpointName }) =>
            generatePath(StudioRoutes.API_EDITOR_ITEM.absolutePath, {
                EDITOR_ITEM_ID: addHumanReadablePrefixToId({ id: endpointId, humanReadablePrefix: endpointName }),
            }),
        type: ({ typeId, typeName }) =>
            generatePath(StudioRoutes.API_EDITOR_ITEM.absolutePath, {
                EDITOR_ITEM_ID: addHumanReadablePrefixToId({ id: typeId, humanReadablePrefix: typeName }),
            }),
        error: ({ errorId, errorName }) =>
            generatePath(StudioRoutes.API_EDITOR_ITEM.absolutePath, {
                EDITOR_ITEM_ID: addHumanReadablePrefixToId({ id: errorId, humanReadablePrefix: errorName }),
            }),
        typesGroup: ({ packageId, packageName }) =>
            generatePath(StudioRoutes.TYPES_GROUP.absolutePath, {
                EDITOR_ITEM_ID: addHumanReadablePrefixToId({ id: packageId, humanReadablePrefix: packageName }),
            }),
        errorsGroup: ({ packageId, packageName }) =>
            generatePath(StudioRoutes.ERRORS_GROUP.absolutePath, {
                EDITOR_ITEM_ID: addHumanReadablePrefixToId({ id: packageId, humanReadablePrefix: packageName }),
            }),
        unknown: () => StudioRoutes.STUDIO.absolutePath,
    });
}
