import { EditorItemPage } from "./EditorItemPage";
import { NothingSelectedPage } from "./NothingSelectedPage";
import { useSelectedSidebarItemId } from "./routes/useSelectedSidebarItemId";
import { StringifiedSidebarItemId } from "./sidebar/ids/StringifiedSidebarItemId";

export const MaybeSelectedEditorItemPage: React.FC = () => {
    const [selectedSidebarItemId] = useSelectedSidebarItemId();

    if (selectedSidebarItemId == null) {
        return <NothingSelectedPage />;
    }

    return (
        <EditorItemPage
            key={StringifiedSidebarItemId.stringify(selectedSidebarItemId)}
            sidebarItemId={selectedSidebarItemId}
        />
    );
};
