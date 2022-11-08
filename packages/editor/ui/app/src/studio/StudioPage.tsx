import { MaybeExistingTypePage } from "./editor-items/types/type/page/MaybeExistingTypePage";
import { NothingSelectedPage } from "./NothingSelectedPage";
import { useSelectedSidebarItemId } from "./routes/useSelectedSidebarItemId";
import { visitSidebarItemId } from "./sidebar/ids/visitSidebarItemId";

export const StudioPage: React.FC = () => {
    const [selectedSidebarItemId] = useSelectedSidebarItemId();

    if (selectedSidebarItemId == null) {
        return <NothingSelectedPage />;
    }

    return visitSidebarItemId(selectedSidebarItemId, {
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
