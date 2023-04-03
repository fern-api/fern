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
        <div className="flex-1 flex flex-col min-w-0">
            {hasTopContent && (
                <div className="relative h-9 flex-shrink-0 mr-3">
                    <div
                        className={classNames(
                            "before:content=[''] before:absolute before:top-full before:h-5 before:w-full before:pointer-events-none before:bg-gradient-to-b before:from-[#fff]",
                            // so it shows above the code blocks
                            "before:z-10"
                        )}
                    />
                    <div
                        className={classNames(
                            "absolute flex items-center left-0 right-0 bottom-0 h-3 translate-y-1/2 gap-3",
                            // so it shows up on top of the above gradient
                            "z-20"
                        )}
                    >
                        {topLeftContent}
                        <div className="flex-1 h-px bg-gray-300" />
                        {topRightContent}
                    </div>
                </div>
            )}
            {children}
        </div>
    );
};
