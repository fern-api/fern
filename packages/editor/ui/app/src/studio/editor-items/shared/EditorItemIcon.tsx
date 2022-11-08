import { Colors, Icon, IconSize } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";

type Color = typeof Colors[keyof typeof Colors];

export declare namespace EditorItemIcon {
    export interface Props {
        icon: IconName;
        color?: Color;
        large: boolean;
    }
}

export const EditorItemIcon: React.FC<EditorItemIcon.Props> = ({ icon, color, large }) => {
    return <Icon icon={icon} color={color} size={large ? 30 : IconSize.STANDARD} />;
};
