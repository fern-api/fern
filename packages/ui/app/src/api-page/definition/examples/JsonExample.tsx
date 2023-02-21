import { Collapse } from "@blueprintjs/core";
import { useBooleanState } from "@fern-api/react-commons";
import { useMemo } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

export declare namespace JsonExample {
    export interface Props {
        title: string;
        rightLabel?: JSX.Element | string;
        json: unknown;
    }
}

export const JsonExample: React.FC<JsonExample.Props> = ({ title, rightLabel, json }) => {
    const jsonString = useMemo(() => JSON.stringify(json, undefined, 4), [json]);

    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(false);

    return (
        <div className="flex flex-col min-h-[25px] rounded overflow-hidden bg-gray-700">
            <div
                className="flex justify-between text-slate-200 px-1.5 py-0.5 cursor-pointer"
                onClick={toggleIsCollapsed}
            >
                <div>{title}</div>
                {rightLabel != null && <div>{rightLabel}</div>}
            </div>
            <div className="overflow-y-auto overscroll-contain text-xs">
                <Collapse isOpen={!isCollapsed}>
                    <SyntaxHighlighter language="json" style={a11yDark}>
                        {jsonString}
                    </SyntaxHighlighter>
                </Collapse>
            </div>
        </div>
    );
};
