import { Collapse, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState } from "@fern-api/react-commons";
import { JsonExample } from "./JsonExample";

export declare namespace CollapsibleJsonExample {
    export interface Props {
        title: string;
        rightLabel?: JSX.Element | string;
        json: unknown;
    }
}

export const CollapsibleJsonExample: React.FC<CollapsibleJsonExample.Props> = ({ title, rightLabel, json }) => {
    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(false);

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-4 cursor-pointer" onClick={toggleIsCollapsed}>
                <div className="flex items-center gap-2 text-[#8F99A8]">
                    <Icon icon={isCollapsed ? IconNames.CHEVRON_RIGHT : IconNames.CHEVRON_DOWN} />
                    <div className="uppercase font-bold">{title}</div>
                </div>
                <div className="flex-1 h-px bg-gray-700" />
                {rightLabel != null && <div>{rightLabel}</div>}
            </div>
            <Collapse isOpen={!isCollapsed}>
                <div className="pt-3">
                    <JsonExample json={json} />
                </div>
            </Collapse>
        </div>
    );
};
