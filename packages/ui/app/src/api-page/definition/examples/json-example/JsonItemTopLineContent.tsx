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
                        ? { content: <div>{"{"}</div>, isEndOfElement: false }
                        : { content: <div>{"{}"}</div>, isEndOfElement: true },
                list: (list) =>
                    list.length > 0
                        ? { content: <div>{"["}</div>, isEndOfElement: false }
                        : { content: <div>{"[]"}</div>, isEndOfElement: true },
                string: (value) => ({
                    content: <div className="text-[#C3937C]">{`"${value}"`}</div>,
                    isEndOfElement: true,
                }),
                number: (value) => ({ content: <div>{value}</div>, isEndOfElement: true }),
                boolean: (value) => ({ content: <div>{value.toString()}</div>, isEndOfElement: true }),
                null: () => ({ content: <div>null</div>, isEndOfElement: true }),
            }),
        [value]
    );

    return (
        <div className="flex">
            {content}
            {isNonLastItemInCollection && isEndOfElement && <div>,</div>}
        </div>
    );
};
