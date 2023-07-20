import { Button, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { useState } from "react";
import styles from "./TitledExample.module.scss";
import { useCopyToClipboard } from "./useCopyToClipboard";

export declare namespace TitledExample {
    export interface Props {
        title: string;
        type: "primary" | "warning";
        actions?: JSX.Element;
        className?: string;
        children: JSX.Element | ((parent: HTMLElement | undefined) => JSX.Element);
    }
}

export const TitledExample: React.FC<TitledExample.Props> = ({ title, type, className, actions, children }) => {
    const [contentRef, setContentRef] = useState<HTMLElement | null>(null);

    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(contentRef?.innerText);

    return (
        <div
            className={classNames(
                "flex flex-col rounded-xl border border-border overflow-hidden basis-full",
                className
            )}
        >
            <div
                className={classNames("border-border flex h-10 items-center justify-between border-b py-1 pl-3 pr-2", {
                    "bg-white/10": type === "primary",
                    "bg-red-500/20": type === "warning",
                })}
            >
                <div className="flex items-center">
                    <div
                        className={classNames("text-xs uppercase tracking-wide", {
                            "text-neutral-300": type === "primary",
                            "text-red-400": type === "warning",
                        })}
                    >
                        {title}
                    </div>
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
                    <div className="flex-1 overflow-auto whitespace-pre py-4" ref={setContentRef}>
                        {typeof children === "function" ? children(contentRef ?? undefined) : children}
                    </div>
                </div>
            </div>
        </div>
    );
};
