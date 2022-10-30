import { Colors, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { noop } from "@fern-api/core-utils";
import { LightweightType } from "../../../mock-backend/MockBackend";
import { SidebarItemRow } from "../items/SidebarItemRow";

export declare namespace TypeSidebarItem {
    export interface Props {
        type: LightweightType;
    }
}

export const TypeSidebarItem: React.FC<TypeSidebarItem.Props> = ({ type }) => {
    return (
        <SidebarItemRow
            itemId={type.typeId}
            label={type.name}
            icon={<Icon icon={IconNames.CUBE} color={Colors.TURQUOISE3} />}
            onDelete={noop}
        />
    );
};
