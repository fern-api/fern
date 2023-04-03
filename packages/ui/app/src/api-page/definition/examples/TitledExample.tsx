import { PropsWithChildren } from "react";

export declare namespace TitledExample {
    export type Props = PropsWithChildren<{
        title: string;
        rightLabel?: JSX.Element | string;
    }>;
}

export const TitledExample: React.FC<TitledExample.Props> = ({ title, rightLabel, children }) => {
    return (
        <div className="flex flex-col rounded overflow-hidden bg-neutral-300">
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2 font-bold">{title}</div>
                {rightLabel != null && <div>{rightLabel}</div>}
            </div>
            <div className="relative border border-gray-300">{children}</div>
        </div>
    );
};
