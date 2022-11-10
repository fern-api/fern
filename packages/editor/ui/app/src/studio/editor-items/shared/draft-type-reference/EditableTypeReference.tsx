import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { DraftTypeReferenceContext } from "./context/DraftTypeReferenceContext";
import { DraftTypeReferenceContextProvider } from "./context/DraftTypeReferenceContextProvider";
import { DraftTypeReferenceContent } from "./DraftTypeReferenceContent";
import { DraftTypeReferencePopover } from "./popover/DraftTypeReferencePopover";

export declare namespace EditableTypeReference {
    export interface Props {
        typeReference: FernApiEditor.TypeReference;
    }
}

export const EditableTypeReference: React.FC<EditableTypeReference.Props> = ({ typeReference }) => {
    return (
        <DraftTypeReferenceContextProvider typeReference={typeReference}>
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
