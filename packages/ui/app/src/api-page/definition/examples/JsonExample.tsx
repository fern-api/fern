import { useMemo } from "react";
import { SyntaxHighlightedCodeExample } from "./SyntaxHighlightedCodeExample";

export declare namespace JsonExample {
    export interface Props {
        json: unknown;
        alwaysShowClipboard?: boolean;
    }
}

export const JsonExample: React.FC<JsonExample.Props> = ({ json, alwaysShowClipboard }) => {
    const jsonString = useMemo(() => JSON.stringify(json, undefined, 4), [json]);

    return <SyntaxHighlightedCodeExample language="json" code={jsonString} alwaysShowClipboard={alwaysShowClipboard} />;
};
