import { Popover2, PopperModifierOverrides } from "@blueprintjs/popover2";
import React, { PropsWithChildren } from "react";
import { DraftTypeReferencePopoverContent } from "./DraftTypeReferencePopoverContent";

const POPPER_MODIFIERS: PopperModifierOverrides = {
    offset: {
        enabled: true,
        options: {
            offset: [0, 10],
        },
    },
};

export const DraftTypeReferencePopover: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <Popover2
            content={<DraftTypeReferencePopoverContent />}
            isOpen
            placement="bottom-start"
            minimal
            modifiers={POPPER_MODIFIERS}
        >
            {children}
        </Popover2>
    );
};
