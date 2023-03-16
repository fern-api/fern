import classNames from "classnames";

export declare namespace TabBarItemWrapper {
    export type Props = React.PropsWithChildren<{
        className?: string;
    }>;
}

export const TabBarItemWrapper: React.FC<TabBarItemWrapper.Props> = ({ className, children }) => {
    return <div className={classNames("flex relative", className)}>{children}</div>;
};
