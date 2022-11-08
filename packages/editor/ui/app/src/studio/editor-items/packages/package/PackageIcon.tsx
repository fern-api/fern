import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { EditorItemIcon } from "../../shared/EditorItemIcon";

export declare namespace PackageIcon {
    export interface Props {
        large?: boolean;
    }
}

export const PackageIcon: React.FC<PackageIcon.Props> = ({ large = false }) => {
    return <EditorItemIcon icon={IconNames.BOX} large={large} />;
};
