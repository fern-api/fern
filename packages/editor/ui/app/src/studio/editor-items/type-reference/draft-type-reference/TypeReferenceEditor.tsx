import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { DraftTypeReferenceContext } from "./context/DraftTypeReferenceContext";
import { DraftTypeReferenceContextProvider } from "./context/DraftTypeReferenceContextProvider";
import { DraftTypeReferenceContent } from "./DraftTypeReferenceContent";
import { DraftTypeReferencePopover } from "./popover/DraftTypeReferencePopover";

export declare namespace TypeReferenceEditor {
    export interface Props {
        typeReference: FernApiEditor.TypeReference;
        onSave: (typeReference: FernApiEditor.TypeReference) => void;
        onCancel: () => void;
    }
}

export const TypeReferenceEditor: React.FC<TypeReferenceEditor.Props> = ({ typeReference, onSave, onCancel }) => {
    return (
        <DraftTypeReferenceContextProvider typeReference={typeReference} onSave={onSave} onCancel={onCancel}>
            <DraftTypeReferenceContext.Consumer>
                {(contextValue) => (
                    <DraftTypeReferencePopover>
                        <DraftTypeReferenceContent nodeId={contextValue().root} />
                    </DraftTypeReferencePopover>
                )}
            </DraftTypeReferenceContext.Consumer>
        </DraftTypeReferenceContextProvider>
    );
};
