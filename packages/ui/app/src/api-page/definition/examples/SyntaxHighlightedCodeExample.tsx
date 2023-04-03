import { useIsHovering } from "@fern-api/react-commons";
import SyntaxHighlighter from "react-syntax-highlighter";
import { routeros } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboardButton } from "./CopyToClipboardButton";

export declare namespace SyntaxHighlightedCodeExample {
    export interface Props {
        code: string;
        language: string;
    }
}

export const SyntaxHighlightedCodeExample: React.FC<SyntaxHighlightedCodeExample.Props> = ({ code, language }) => {
    const { isHovering, ...containerCallbacks } = useIsHovering();

    return (
        <div {...containerCallbacks} className="relative">
            <SyntaxHighlighter language={language} style={routeros}>
                {code}
            </SyntaxHighlighter>
            {isHovering && <CopyToClipboardButton contentToCopy={code} />}
        </div>
    );
};
