import { useMemo } from "react";
import { SyntaxHighlightedCodeExample } from "./SyntaxHighlightedCodeExample";

export declare namespace JsonExample {
    export interface Props {
        json: unknown;
    }
}

export const JsonExample: React.FC<JsonExample.Props> = ({ json }) => {
    const jsonString = useMemo(() => JSON.stringify(json, undefined, 4), [json]);

    return <SyntaxHighlightedCodeExample language="json" code={jsonString} />;
};
