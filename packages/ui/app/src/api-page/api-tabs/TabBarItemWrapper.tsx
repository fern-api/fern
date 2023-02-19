import classNames from "classnames";

export declare namespace TabBarItemWrapper {
    export type Props = React.PropsWithChildren<{
        includeBottomBorder: boolean;
        className?: string;
    }>;
}

export const TabBarItemWrapper: React.FC<TabBarItemWrapper.Props> = ({ includeBottomBorder, className, children }) => {
    return (
        <div
            className={classNames(
                "flex border-b",
                includeBottomBorder ? "border-b-gray-400" : "border-b-transparent",
                className
            )}
        >
            {children}
        </div>
    );
};
