import { TwoColumnTable, TwoColumnTableRow } from "@fern-api/common-components";
import { FernRegistry } from "@fern-fern/registry";
import { getKeyValuePairsInOrder } from "../../../commons/getKeyValuePairsInOrder";

export declare namespace ExampleRequestHeaders {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
        example: FernRegistry.ExampleEndpointCall;
    }
}

export const ExampleRequestHeaders: React.FC<ExampleRequestHeaders.Props> = ({ endpoint, example }) => {
    return (
        <div className="flex flex-col">
            <div className="font-bold">Request headers</div>
            <TwoColumnTable className="text-xs mt-2 gap-2">
                {getKeyValuePairsInOrder({
                    keysInOrder: endpoint.headers.map((header) => header.key),
                    values: example.headers,
                }).map(({ key: header, value }) => (
                    <TwoColumnTableRow key={header} label={header}>
                        {JSON.stringify(value)}
                    </TwoColumnTableRow>
                ))}
            </TwoColumnTable>
        </div>
    );
};
