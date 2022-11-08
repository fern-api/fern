import { Colors } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { EditorItemIcon } from "../../shared/EditorItemIcon";

export declare namespace ErrorIcon {
    export interface Props {
        large?: boolean;
    }
}

export const ErrorIcon: React.FC<ErrorIcon.Props> = ({ large = false }) => {
    return <EditorItemIcon icon={IconNames.HIGH_PRIORITY} color={Colors.ORANGE3} large={large} />;
};
