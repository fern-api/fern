import classNames from "classnames";
import { PropsWithChildren } from "react";

export declare namespace Cards {
    export type Props = PropsWithChildren<{
        center?: boolean;
    }>;
}

export const Cards: React.FC<Cards.Props> = ({ center, children }) => {
    return (
        <div
            className={classNames("flex flex-wrap gap-6", {
                "justify-center": center,
            })}
        >
            {children}
        </div>
    );
};
