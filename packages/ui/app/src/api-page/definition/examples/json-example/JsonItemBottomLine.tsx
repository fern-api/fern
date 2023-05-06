import { size } from "lodash-es";
import { JsonExampleLine } from "./JsonExampleLine";
import { visitJsonItem } from "./visitJsonItem";

export declare namespace JsonItemBottomLine {
    export interface Props {
        value: unknown;
        isNonLastItemInCollection: boolean;
    }
}

export const JsonItemBottomLine: React.FC<JsonItemBottomLine.Props> = ({ value, isNonLastItemInCollection }) => {
    const element = visitJsonItem(value, {
        object: (object) => (size(object) === 0 ? undefined : <span>{"}"}</span>),
        list: (list) => (list.length === 0 ? undefined : <span>{"]"}</span>),
        string: () => undefined,
        number: () => undefined,
        boolean: () => undefined,
        null: () => undefined,
    });

    if (element == null) {
        return null;
    }

    return (
        <JsonExampleLine>
            {element}
            {isNonLastItemInCollection && <span>,</span>}
        </JsonExampleLine>
    );
};
