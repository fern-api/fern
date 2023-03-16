import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState, useIsHovering } from "@fern-api/react-commons";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { irBlack } from "react-syntax-highlighter/dist/esm/styles/hljs";

export declare namespace JsonExample {
    export interface Props {
        json: unknown;
    }
}

export const JsonExample: React.FC<JsonExample.Props> = ({ json }) => {
    const jsonString = useMemo(() => JSON.stringify(json, undefined, 4), [json]);

    const { isHovering, ...containerCallbacks } = useIsHovering();

    const { value: isCopied, setTrue: setIsCopied, setFalse: setIsNotCopied } = useBooleanState(false);

    const onClickCopy = useCallback(async () => {
        setIsCopied();
        await navigator.clipboard.writeText(jsonString);
    }, [jsonString, setIsCopied]);

    return (
        <div {...containerCallbacks} className="relative rounded overflow-hidden">
            <SyntaxHighlighter language="json" style={irBlack}>
                {jsonString}
            </SyntaxHighlighter>
            {isHovering && (
                <div
                    className={classNames(
                        "absolute top-2 right-2 cursor-pointer",
                        isCopied ? "text-green-500" : "text-gray-500 hover:text-gray-300"
                    )}
                    onClick={onClickCopy}
                    onMouseLeave={setIsNotCopied}
                >
                    <Icon icon={isCopied ? IconNames.TICK : IconNames.CLIPBOARD} />
                </div>
            )}
        </div>
    );
};
