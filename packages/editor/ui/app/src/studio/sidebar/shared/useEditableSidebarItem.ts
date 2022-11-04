import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback, useMemo } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { DraftSidebarItemId } from "../context/SidebarContext";
import { useSidebarContext } from "../context/useSidebarContext";

export declare namespace useEditableSidebarItem {
    export interface Args<DefinitionId, ParentId = FernApiEditor.PackageId> {
        definitionId: DefinitionId;
        parent: ParentId;
        constructCreateTransaction: (
            args: constructCreateTransaction.Args<DefinitionId, ParentId>
        ) => FernApiEditor.transactions.Transaction;
        constructRenameTransaction: (
            args: constructRenameTransaction.Args<DefinitionId, ParentId>
        ) => FernApiEditor.transactions.Transaction;
        constructDeleteTransaction: (
            args: constructDeleteTransaction.Args<DefinitionId, ParentId>
        ) => FernApiEditor.transactions.Transaction;
        isEqualToDraft: (args: isEqualToDraft.Args<DefinitionId, ParentId>) => boolean;
    }

    export namespace constructCreateTransaction {
        export interface Args<DefinitionId, ParentId = FernApiEditor.PackageId>
            extends WithMetadata<DefinitionId, ParentId> {
            name: string;
        }
    }

    export namespace constructRenameTransaction {
        export interface Args<DefinitionId, ParentId = FernApiEditor.PackageId>
            extends WithMetadata<DefinitionId, ParentId> {
            newName: string;
        }
    }

    export namespace constructDeleteTransaction {
        export type Args<DefinitionId, ParentId = FernApiEditor.PackageId> = WithMetadata<DefinitionId, ParentId>;
    }

    export namespace isEqualToDraft {
        export interface Args<DefinitionId, ParentId = FernApiEditor.PackageId>
            extends WithMetadata<DefinitionId, ParentId> {
            draft: DraftSidebarItemId;
        }
    }

    interface WithMetadata<DefinitionId, ParentId = FernApiEditor.PackageId> {
        definitionId: DefinitionId;
        parent: ParentId;
    }

    export interface Return {
        isDraft: boolean;
        onRename: (newName: string) => void;
        onDelete: () => void;
    }
}

export function useEditableSidebarItem<DefinitionId, ParentId = FernApiEditor.PackageId>({
    definitionId,
    parent,
    constructCreateTransaction,
    constructRenameTransaction,
    constructDeleteTransaction,
    isEqualToDraft,
}: useEditableSidebarItem.Args<DefinitionId, ParentId>): useEditableSidebarItem.Return {
    const { submitTransaction } = useApiEditorContext();

    const onDelete = useCallback(() => {
        submitTransaction(constructDeleteTransaction({ definitionId, parent }));
    }, [submitTransaction, constructDeleteTransaction, definitionId, parent]);

    const { draft, setDraft } = useSidebarContext();
    const isDraft = useMemo(
        () => draft != null && isEqualToDraft({ draft, definitionId, parent }),
        [definitionId, draft, isEqualToDraft, parent]
    );

    const deleteDraft = useCallback(() => {
        setDraft(undefined);
    }, [setDraft]);

    const onRename = useCallback(
        (newName: string) => {
            if (isDraft) {
                deleteDraft();
            }
            const transaction = isDraft
                ? constructCreateTransaction({ definitionId, name: newName, parent })
                : constructRenameTransaction({ definitionId, newName, parent });
            submitTransaction(transaction);
        },
        [
            isDraft,
            constructCreateTransaction,
            definitionId,
            parent,
            constructRenameTransaction,
            submitTransaction,
            deleteDraft,
        ]
    );

    return {
        isDraft,
        onRename,
        onDelete,
    };
}
