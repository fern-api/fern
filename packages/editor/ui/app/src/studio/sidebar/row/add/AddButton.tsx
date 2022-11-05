import { IconNames } from "@blueprintjs/icons";
import { SidebarItemRowButton } from "../button/SidebarItemRowButton";

export declare namespace AddButton {
    export interface Props {
        onClick: () => void;
        hidden: boolean;
    }
}

export const AddButton: React.FC<AddButton.Props> = ({ onClick, hidden }) => {
    return <SidebarItemRowButton icon={IconNames.PLUS} onClick={onClick} hidden={hidden} />;
};
