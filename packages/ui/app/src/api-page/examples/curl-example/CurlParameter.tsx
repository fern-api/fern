import { JsonExampleString } from "../json-example/JsonExampleString";

export declare namespace CurlParameter {
    export interface Props {
        paramKey: string;
        value?: string;
        doNotAddQuotesAroundValue?: boolean;
    }
}

export const CurlParameter: React.FC<CurlParameter.Props> = ({
    paramKey,
    value,
    doNotAddQuotesAroundValue = false,
}) => {
    return (
        <>
            <span className="text-text-muted">{paramKey}</span>
            {value != null && (
                <>
                    {" "}
                    <JsonExampleString value={value} doNotAddQuotes={doNotAddQuotesAroundValue} />
                </>
            )}
        </>
    );
};
