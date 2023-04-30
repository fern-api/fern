import classNames from "classnames";
import { PropsWithChildren } from "react";

export declare namespace TitledExample {
    export type Props = PropsWithChildren<{
        title: string;
        rightLabel?: JSX.Element | string;
        className?: string;
    }>;
}

export const TitledExample: React.FC<TitledExample.Props> = ({ title, rightLabel, className, children }) => {
    return (
        <div className={classNames("flex flex-col min-h-0 rounded border border-[#252529]", className)}>
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2 font-bold">{title}</div>
                {rightLabel != null && <div>{rightLabel}</div>}
            </div>
            <div className="flex flex-1 min-h-0">{children}</div>
        </div>
    );
};
