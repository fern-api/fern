import { Classes, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";

export declare namespace EnvironmentSelectButton {
    export interface Props {
        environmentName: string | undefined;
    }
}

export const EnvironmentSelectButton: React.FC<EnvironmentSelectButton.Props> = ({ environmentName }) => {
    return (
        <div className="flex items-center justify-center gap-1 text-xs cursor-pointer">
            <div
                className={classNames({
                    [Classes.SKELETON]: environmentName == null,
                })}
            >
                {environmentName ?? "SKELETON_TEXT"}
            </div>
            <Icon icon={IconNames.CHEVRON_DOWN} size={12} />
        </div>
    );
};
