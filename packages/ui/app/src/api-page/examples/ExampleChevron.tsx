import { Icon } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { assertNever } from "@fern-api/core-utils";
import classNames from "classnames";

export declare namespace ExampleChevron {
    export interface Props {
        direction: "left" | "right";
        onClick: (() => void) | undefined;
    }
}

export const ExampleChevron: React.FC<ExampleChevron.Props> = ({ direction, onClick }) => {
    return (
        <Icon
            className={classNames(onClick != null ? "text-black" : "text-gray-500", {
                ["cursor-pointer"]: onClick != null,
            })}
            icon={getIconForDirection(direction)}
            onClick={onClick}
        />
    );
};

function getIconForDirection(direction: "left" | "right"): IconName {
    switch (direction) {
        case "left":
            return IconNames.CHEVRON_LEFT;
        case "right":
            return IconNames.CHEVRON_RIGHT;
        default:
            assertNever(direction);
    }
}
