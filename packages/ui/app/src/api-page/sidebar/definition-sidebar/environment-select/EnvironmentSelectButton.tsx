import { Classes, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";

export declare namespace EnvironmentSelectButton {
    export interface Props {
        label: string | undefined;
    }
}

export const EnvironmentSelectButton: React.FC<EnvironmentSelectButton.Props> = ({ label }) => {
    return (
        <div className="flex items-center justify-center gap-1 text-xs cursor-pointer">
            <div
                className={classNames({
                    [Classes.SKELETON]: label == null,
                })}
            >
                {label ?? "SKELETON_TEXT"}
            </div>
            <Icon icon={IconNames.CHEVRON_DOWN} size={12} />
        </div>
    );
};
