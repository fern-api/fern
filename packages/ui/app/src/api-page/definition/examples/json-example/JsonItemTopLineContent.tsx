import { size } from "lodash-es";
import { useMemo } from "react";
import { visitJsonItem } from "./visitJsonItem";

export declare namespace JsonItemTopLineContent {
    export interface Props {
        value: unknown;
        isNonLastItemInCollection: boolean;
    }
}

export const JsonItemTopLineContent: React.FC<JsonItemTopLineContent.Props> = ({
    value,
    isNonLastItemInCollection,
}) => {
    const { content, isEndOfElement } = useMemo(
        (): { content: JSX.Element; isEndOfElement: boolean } =>
            visitJsonItem(value, {
                object: (object) =>
                    size(object) > 0
                        ? { content: <span>{"{"}</span>, isEndOfElement: false }
                        : { content: <span>{"{}"}</span>, isEndOfElement: true },
                list: (list) =>
                    list.length > 0
                        ? { content: <span>{"["}</span>, isEndOfElement: false }
                        : { content: <span>{"[]"}</span>, isEndOfElement: true },
                string: (value) => ({
                    content: <span className="text-[#C3937C]">{`"${value}"`}</span>,
                    isEndOfElement: true,
                }),
                number: (value) => ({ content: <span className="text-[#acbd9f]">{value}</span>, isEndOfElement: true }),
                boolean: (value) => ({
                    content: <span className="text-[#6699ce]">{value.toString()}</span>,
                    isEndOfElement: true,
                }),
                null: () => ({ content: <span>null</span>, isEndOfElement: true }),
            }),
        [value]
    );

    return (
        <span className="whitespace-nowrap">
            {content}
            {isNonLastItemInCollection && isEndOfElement && <span>,</span>}
        </span>
    );
};
