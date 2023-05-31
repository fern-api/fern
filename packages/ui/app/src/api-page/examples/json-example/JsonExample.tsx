import React, { useCallback, useState } from "react";
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
    const [ref, setRef] = useState<HTMLElement | null>(null);

    const contextValue = useCallback(
        (): JsonExampleContextValue => ({
            selectedProperty,
            containerRef: ref ?? undefined,
        }),
        [ref, selectedProperty]
    );

    return (
        <div className="flex-1 overflow-auto p-2" ref={setRef}>
            <JsonExampleContext.Provider value={contextValue}>
                <JsonItemTopLine value={json} isNonLastItemInCollection={false} />
                <JsonItemMiddleLines value={json} />
                <JsonItemBottomLine value={json} isNonLastItemInCollection={false} />
            </JsonExampleContext.Provider>
        </div>
    );
};
