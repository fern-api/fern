import classNames from "classnames";
import React, { PropsWithChildren } from "react";

export declare namespace Page {
    export type Props = PropsWithChildren<{
        className?: string;
    }>;
}

export const Page = React.forwardRef<HTMLDivElement, Page.Props>(function Page({ className, children }, ref) {
    return (
        <div ref={ref} className={classNames(className, "flex overflow-y-auto flex-1")}>
            {children}
        </div>
    );
});
