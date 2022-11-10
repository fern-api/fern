import { Popover2 } from "@blueprintjs/popover2";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { ChangeTypeReferencePopoverContent } from "./ChangeTypeReferencePopoverContent";

export declare namespace ChangeTypeReferencePopover {
    export type Props = React.PropsWithChildren<{
        isOpen: boolean;
        onInteraction: (isOpen: boolean, event?: React.SyntheticEvent<HTMLElement>) => void;
        onChange: (typeReference: FernApiEditor.TypeReference) => void;
    }>;
}

export const ChangeTypeReferencePopover: React.FC<ChangeTypeReferencePopover.Props> = ({
    isOpen,
    onInteraction,
    onChange,
    children,
}) => {
    return (
        <Popover2
            isOpen={isOpen}
            onInteraction={onInteraction}
            content={<ChangeTypeReferencePopoverContent onChange={onChange} />}
            placement="bottom-start"
        >
            {children}
        </Popover2>
    );
};
