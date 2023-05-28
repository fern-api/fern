import { useIsDarkTheme } from "@fern-api/theme";
import SyntaxHighlighter from "react-syntax-highlighter";
import { routeros, sunburst } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { ExampleWrapper } from "./ExampleWrapper";

export declare namespace SyntaxHighlightedCodeExample {
    export interface Props {
        code: string;
        language: string;
    }
}

export const SyntaxHighlightedCodeExample: React.FC<SyntaxHighlightedCodeExample.Props> = ({ code, language }) => {
    const isDarkTheme = useIsDarkTheme();
    return (
        <ExampleWrapper>
            {({ style }) => (
                <SyntaxHighlighter language={language} style={isDarkTheme ? sunburst : routeros} customStyle={style}>
                    {code}
                </SyntaxHighlighter>
            )}
        </ExampleWrapper>
    );
};
