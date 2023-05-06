import { useContext, useMemo } from "react";
import { JsonExampleDepthContext, JsonExampleDepthContextValue } from "./contexts/JsonExampleDepthContext";
import { JsonListItems } from "./JsonListItems";
import { JsonObjectProperties } from "./JsonObjectProperties";
import { visitJsonItem } from "./visitJsonItem";

export declare namespace JsonItemMiddleLines {
    export interface Props {
        value: unknown;
    }
}

export const JsonItemMiddleLines: React.FC<JsonItemMiddleLines.Props> = ({ value }) => {
    const { depth } = useContext(JsonExampleDepthContext);

    const contextValue = useMemo((): JsonExampleDepthContextValue => ({ depth: depth + 1 }), [depth]);

    return (
        <JsonExampleDepthContext.Provider value={contextValue}>
            {visitJsonItem(value, {
                object: (object) => <JsonObjectProperties object={object} />,
                list: (list) => <JsonListItems items={list} />,
                string: () => null,
                number: () => null,
                boolean: () => null,
                null: () => null,
            })}
        </JsonExampleDepthContext.Provider>
    );
};
