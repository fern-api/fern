import { useIsHovering } from "@fern-api/react-commons";
import { useMemo } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { irBlack } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboardButton } from "./CopyToClipboardButton";

export declare namespace JsonExample {
    export interface Props {
        json: unknown;
    }
}

export const JsonExample: React.FC<JsonExample.Props> = ({ json }) => {
    const jsonString = useMemo(() => JSON.stringify(json, undefined, 4), [json]);

    const { isHovering, ...containerCallbacks } = useIsHovering();

    return (
        <div {...containerCallbacks} className="relative rounded overflow-hidden">
            <SyntaxHighlighter language="json" style={irBlack}>
                {jsonString}
            </SyntaxHighlighter>
            {isHovering && <CopyToClipboardButton contentToCopy={jsonString} />}
        </div>
    );
};
