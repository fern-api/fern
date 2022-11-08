import { Colors } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { EditorItemIcon } from "../../shared/EditorItemIcon";

export declare namespace EndpointIcon {
    export interface Props {
        large?: boolean;
    }
}

export const EndpointIcon: React.FC<EndpointIcon.Props> = ({ large = false }) => {
    return <EditorItemIcon icon={IconNames.EXCHANGE} color={Colors.GREEN4} large={large} />;
};
