import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { PropsWithChildren, useMemo } from "react";
import styles from "./TitledExample.module.scss";
import { useCopyToClipboard } from "./useCopyToClipboard";

export declare namespace TitledExample {
    export type Props = PropsWithChildren<{
        title: string;
        titleRightContent?: JSX.Element;
        actions?: JSX.Element;
        className?: string;
        copyableExample: unknown;
    }>;
}

export const TitledExample: React.FC<TitledExample.Props> = ({
    title,
    titleRightContent,
    className,
    actions,
    copyableExample,
    children,
}) => {
    const exampleAsString = useMemo(
        () => (typeof copyableExample === "string" ? copyableExample : JSON.stringify(copyableExample, undefined, 2)),
        [copyableExample]
    );
    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(exampleAsString);

    return (
        <div
            className={classNames(
                "flex flex-col basis-full min-h-0 rounded-xl border border-[#252529] overflow-hidden",
                className
            )}
        >
            <div className="bg-accentPrimary/30 flex items-center justify-between py-1 pl-3 pr-2">
                <div className="flex items-center gap-2">
                    <div className="font-medium uppercase text-[#A7A7B0]">{title}</div>
                    {titleRightContent}
                </div>
                <div className="flex gap-2">
                    {actions}
                    <Button
                        minimal
                        icon={wasJustCopied ? IconNames.TICK : IconNames.CLIPBOARD}
                        text="Copy"
                        onClick={copyToClipboard}
                    />
                </div>
            </div>
            <div className="flex min-h-0 flex-1">
                <div
                    className={classNames(
                        styles.code,
                        className,
                        "flex-1 leading-relaxed overflow-auto text-xs p-2 bg-accentHighlight"
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};
