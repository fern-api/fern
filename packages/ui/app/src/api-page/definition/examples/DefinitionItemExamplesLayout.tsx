import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { PropsWithChildren } from "react";

export declare namespace DefinitionItemExamplesLayout {
    export type Props = PropsWithChildren<{
        topRightContent?: JSX.Element;
    }>;
}

export const DefinitionItemExamplesLayout: React.FC<DefinitionItemExamplesLayout.Props> = ({
    topRightContent,
    children,
}) => {
    return (
        <div className={classNames(Classes.DARK, "flex-1 flex flex-col bg-[#272A2A] min-w-0")}>
            <div className="relative h-9 flex-shrink-0 mr-3">
                <div
                    className={classNames(
                        "before:content=[''] before:absolute before:top-full before:h-5 before:w-full before:pointer-events-none before:bg-gradient-to-b before:from-[#272A2A]",
                        // so it shows above the code blocks
                        "before:z-10"
                    )}
                />
                <div
                    className={classNames(
                        "absolute flex items-center left-0 right-0 bottom-0 h-3 translate-y-1/2",
                        // so it shows up on top of the above gradient
                        "z-20"
                    )}
                >
                    <div className="flex-1 h-px bg-gray-600" />
                    {topRightContent}
                </div>
            </div>
            {children}
        </div>
    );
};
