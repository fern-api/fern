import { TwoColumnTableRow } from "@fern-api/common-components";
import { getKeyValuePairsInOrder } from "../../../commons/getKeyValuePairsInOrder";
import { MonospaceText } from "../../../commons/MonospaceText";

export declare namespace EndpointExampleUrlParameters {
    export interface Props {
        allowedKeys: string[];
        values: Record<string, unknown>;
        renderKey?: (key: string) => string;
    }
}

export const EndpointExampleUrlParameters: React.FC<EndpointExampleUrlParameters.Props> = ({
    allowedKeys,
    values,
    renderKey,
}) => {
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
};
