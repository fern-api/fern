import { useIsDarkTheme } from "@fern-api/theme";
import SyntaxHighlighter from "react-syntax-highlighter";
import { routeros, sunburst } from "react-syntax-highlighter/dist/esm/styles/hljs";

export declare namespace SyntaxHighlightedCodeExample {
    export interface Props {
        code: string;
        language: string;
    }
}

export const SyntaxHighlightedCodeExample: React.FC<SyntaxHighlightedCodeExample.Props> = ({ code, language }) => {
    const isDarkTheme = useIsDarkTheme();
    return (
        <SyntaxHighlighter
            language={language}
            style={isDarkTheme ? sunburst : routeros}
            customStyle={{ backgroundColor: "transparent" }}
        >
            {code}
        </SyntaxHighlighter>
    );
};
