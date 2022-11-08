import { MaybeExistingTypePage } from "./editor-items/types/type/page/MaybeExistingTypePage";
import { NothingSelectedPage } from "./NothingSelectedPage";
import { SidebarItemId } from "./sidebar/ids/SidebarItemId";
import { visitSidebarItemId } from "./sidebar/ids/visitSidebarItemId";

export declare namespace EditorItemPage {
    export interface Props {
        sidebarItemId: SidebarItemId;
    }
}

export const EditorItemPage: React.FC<EditorItemPage.Props> = ({ sidebarItemId }) => {
    return visitSidebarItemId(sidebarItemId, {
        apiConfiguration: () => <div>api configuration</div>,
        sdkConfiguration: () => <div>sdk configuration</div>,
        package: () => <div>package_</div>,
        endpoint: () => <div>endpoint</div>,
        type: ({ typeId }) => <MaybeExistingTypePage typeId={typeId} />,
        error: () => <div>error</div>,
        typesGroup: () => <div>types group</div>,
        errorsGroup: () => <div>errors group</div>,
        unknown: () => <NothingSelectedPage />,
    });
};
