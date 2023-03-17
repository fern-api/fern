import { IconSize } from "@blueprintjs/core";
import { IoMdCube } from "react-icons/io";

export declare namespace TypeIcon {
    export interface Props {
        color: string;
        size?: number;
    }
}

export const TypeIcon: React.FC<TypeIcon.Props> = ({ color, size = IconSize.STANDARD }) => {
    return <IoMdCube color={color} size={size} />;
};
