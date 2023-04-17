import { useIsHovering } from "@fern-api/react-commons";
import { useIsDarkTheme } from "@fern-api/theme";
import SyntaxHighlighter from "react-syntax-highlighter";
import { routeros, sunburst } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboardButton } from "./CopyToClipboardButton";

export declare namespace SyntaxHighlightedCodeExample {
    export interface Props {
        code: string;
        language: string;
    }
}

export const SyntaxHighlightedCodeExample: React.FC<SyntaxHighlightedCodeExample.Props> = ({ code, language }) => {
    const { isHovering, ...containerCallbacks } = useIsHovering();

    const isDarkTheme = useIsDarkTheme();

    return (
        <div {...containerCallbacks} className="relative">
            <SyntaxHighlighter language={language} style={isDarkTheme ? sunburst : routeros}>
                {code}
            </SyntaxHighlighter>
            {isHovering && <CopyToClipboardButton contentToCopy={code} />}
        </div>
    );
};
