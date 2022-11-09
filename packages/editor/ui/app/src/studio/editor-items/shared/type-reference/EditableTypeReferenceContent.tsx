import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useIsDirectlyHovering } from "@fern-ui/react-commons";
import React from "react";
import { ControlledEditableTypeReferenceContent } from "./ControlledEditableTypeReferenceContent";
import { ChangeTypeReferencePopover } from "./popover/ChangeTypeReferencePopover";
import { usePopoverHandlers } from "./popover/usePopoverHandlers";

export declare namespace EditableTypeReferenceContent {
    export interface Props {
        onChange: (typeReference: FernApiEditor.TypeReference) => void;
        children: JSX.Element;
    }
}

export const EditableTypeReferenceContent: React.FC<EditableTypeReferenceContent.Props> = ({ onChange, children }) => {
    const { isHovering, onMouseOver, onMouseOut } = useIsDirectlyHovering();

    // console.log({ isHovering }, typeReference);

    const { isPopoverOpen, onPopoverInteraction } = usePopoverHandlers();

    return (
        <ChangeTypeReferencePopover onChange={onChange} isOpen={isPopoverOpen} onInteraction={onPopoverInteraction}>
            <ControlledEditableTypeReferenceContent
                isHovering={isHovering}
                isPopoverOpen={isPopoverOpen}
                onMouseOut={onMouseOut}
                onMouseOver={onMouseOver}
            >
                {children}
            </ControlledEditableTypeReferenceContent>
        </ChangeTypeReferencePopover>
    );
};
