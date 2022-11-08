import { Colors } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { EditorItemIcon } from "../../shared/EditorItemIcon";

export declare namespace TypeIcon {
    export interface Props {
        large?: boolean;
    }
}

export const TypeIcon: React.FC<TypeIcon.Props> = ({ large = false }) => {
    return <EditorItemIcon icon={IconNames.CUBE} color={Colors.TURQUOISE3} large={large} />;
};
