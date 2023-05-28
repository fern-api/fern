import classNames from "classnames";
import { PropsWithChildren } from "react";

export declare namespace DefinitionItemExamplesLayout {
    export type Props = PropsWithChildren<{
        topLeftContent?: JSX.Element;
        topRightContent?: JSX.Element;
    }>;
}

export const DefinitionItemExamplesLayout: React.FC<DefinitionItemExamplesLayout.Props> = ({
    topLeftContent,
    topRightContent,
    children,
}) => {
    const hasTopContent = topLeftContent != null || topRightContent != null;
    return (
        <div className="flex min-w-0 flex-1 flex-col">
            {hasTopContent && (
                <div className="relative mr-3 h-9 shrink-0">
                    <div
                        className={classNames(
                            "absolute flex items-center left-0 right-0 bottom-0 h-3 translate-y-1/2 gap-3",
                            // so it shows up on top of the above gradient
                            "z-20"
                        )}
                    >
                        {topLeftContent}
                        <div className="h-px flex-1 bg-gray-300" />
                        {topRightContent}
                    </div>
                </div>
            )}
            {children}
        </div>
    );
};
