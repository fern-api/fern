import { TwoColumnTableRow } from "@fern-api/common-components";
import { getKeyValuePairsInOrder } from "../../../../commons/getKeyValuePairsInOrder";
import { MonospaceText } from "../../../../commons/MonospaceText";

export declare namespace EndpointExampleUrlParameters {
    export interface Props<K extends string> {
        allowedKeys: K[];
        values: Record<K, unknown>;
        renderKey?: (key: K) => string;
    }
}

export function EndpointExampleUrlParameters<K extends string>({
    allowedKeys,
    values,
    renderKey,
}: EndpointExampleUrlParameters.Props<K>): JSX.Element {
    return (
        <>
            {getKeyValuePairsInOrder({ keysInOrder: allowedKeys, values }).map(({ key, value }) => (
                <TwoColumnTableRow
                    key={key}
                    label={
                        <MonospaceText className="text-[11px]">
                            {renderKey != null ? renderKey(key) : key}
                        </MonospaceText>
                    }
                >
                    {JSON.stringify(value)}
                </TwoColumnTableRow>
            ))}
        </>
    );
}
