import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useTimeout } from "@fern-api/react-commons";
import classNames from "classnames";
import { useCallback, useState } from "react";

export declare namespace CopyToClipboardButton {
    export interface Props {
        contentToCopy: string;
    }
}

export const CopyToClipboardButton: React.FC<CopyToClipboardButton.Props> = ({ contentToCopy }) => {
    const [isCopied, setIsCopied] = useState(false);

    const onClickCopy = useCallback(async () => {
        setIsCopied(true);
        await navigator.clipboard.writeText(contentToCopy);
    }, [contentToCopy]);

    useTimeout(
        () => {
            setIsCopied(false);
        },
        isCopied ? 2_000 : undefined
    );

    return (
        <div
            className={classNames(
                "absolute top-2 right-2 cursor-pointer",
                isCopied ? "text-green-500" : "text-gray-400 hover:text-gray-500"
            )}
            onClick={onClickCopy}
        >
            <Icon icon={isCopied ? IconNames.TICK : IconNames.CLIPBOARD} />
        </div>
    );
};
