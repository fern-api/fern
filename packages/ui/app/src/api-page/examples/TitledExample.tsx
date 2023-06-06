import { Button, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { useState } from "react";
import styles from "./TitledExample.module.scss";
import { useCopyToClipboard } from "./useCopyToClipboard";

export declare namespace TitledExample {
    export interface Props {
        title: string;
        titleRightContent?: JSX.Element;
        actions?: JSX.Element;
        className?: string;
        children: JSX.Element | ((parent: HTMLElement | undefined) => JSX.Element);
    }
}

export const TitledExample: React.FC<TitledExample.Props> = ({
    title,
    titleRightContent,
    className,
    actions,
    children,
}) => {
    const [contentRef, setContentRef] = useState<HTMLElement | null>(null);

    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(contentRef?.innerText);

    return (
        <div
            className={classNames(
                "flex flex-col rounded-xl border border-border overflow-hidden basis-full",
                className
            )}
        >
            <div className="border-border flex h-10 items-center justify-between border-b bg-white/10 py-1 pl-3 pr-2">
                <div className="flex items-center gap-2">
                    <div className="text-xs uppercase tracking-wide text-neutral-300">{title}</div>
                    {titleRightContent}
                </div>
                <div className="flex gap-2">
                    {actions}
                    <Button
                        minimal
                        disabled={copyToClipboard == null}
                        icon={
                            <Icon
                                icon={wasJustCopied ? IconNames.TICK : IconNames.DUPLICATE}
                                className={classNames({
                                    "!text-accentPrimary": wasJustCopied,
                                })}
                            />
                        }
                        onClick={copyToClipboard}
                    />
                </div>
            </div>
            <div className="flex min-h-0 flex-1">
                <div
                    className={classNames(
                        styles.code,
                        className,
                        "flex flex-1 leading-relaxed text-xs bg-gray-dark/40 min-w-0"
                    )}
                >
                    <div className="flex-1 overflow-auto whitespace-pre py-2" ref={setContentRef}>
                        {typeof children === "function" ? children(contentRef ?? undefined) : children}
                    </div>
                </div>
            </div>
        </div>
    );
};
