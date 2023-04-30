import { useCallback } from "react";
import { MonospaceText } from "../../../../commons/MonospaceText";
import { JsonExampleContext, JsonExampleContextValue } from "./contexts/JsonExampleContext";
import { JsonPropertyPath } from "./contexts/JsonPropertyPath";
import { JsonItemBottomLine } from "./JsonItemBottomLine";
import { JsonItemMiddleLines } from "./JsonItemMiddleLines";
import { JsonItemTopLine } from "./JsonItemTopLine";

export declare namespace JsonExample {
    export interface Props {
        json: unknown;
        selectedProperty: JsonPropertyPath | undefined;
    }
}

export const JsonExample: React.FC<JsonExample.Props> = ({ json, selectedProperty }) => {
    const contextValue = useCallback(
        (): JsonExampleContextValue => ({
            selectedProperty,
        }),
        [selectedProperty]
    );

    return (
        <JsonExampleContext.Provider value={contextValue}>
            <MonospaceText className="leading-relaxed bg-[#252529] py-1 flex-1 overflow-auto">
                <JsonItemTopLine value={json} isNonLastItemInCollection={false} />
                <JsonItemMiddleLines value={json} />
                <JsonItemBottomLine value={json} isNonLastItemInCollection={false} />
            </MonospaceText>
        </JsonExampleContext.Provider>
    );
};
