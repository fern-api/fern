import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useIsHovering } from "@fern-ui/react-commons";
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
    const { isHovering, onMouseLeave, onMouseMove, onMouseOver } = useIsHovering();

    const { isPopoverOpen, onPopoverInteraction } = usePopoverHandlers();

    return (
        <ChangeTypeReferencePopover onChange={onChange} isOpen={isPopoverOpen} onInteraction={onPopoverInteraction}>
            <ControlledEditableTypeReferenceContent
                isHovering={isHovering}
                isPopoverOpen={isPopoverOpen}
                onMouseLeave={onMouseLeave}
                onMouseMove={onMouseMove}
                onMouseOver={onMouseOver}
            >
                {children}
            </ControlledEditableTypeReferenceContent>
        </ChangeTypeReferencePopover>
    );
};
