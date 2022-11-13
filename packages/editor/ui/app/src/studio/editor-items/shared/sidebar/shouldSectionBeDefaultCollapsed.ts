import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MaybeDraftPackage } from "../../../sidebar/drafts/DraftableItem";

export function shouldSectionBeDefaultCollapsed<T>({
    parent,
    getItems,
}: {
    parent: MaybeDraftPackage;
    getItems: (package_: FernApiEditor.Package) => T[];
}): boolean {
    return !parent.isDraft && getItems(parent).length > 0;
}
