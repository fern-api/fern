import { JsonExampleString } from "../json-example/JsonExampleString";

export declare namespace CurlParameter {
    export interface Props {
        paramKey: string;
        value?: string;
        doNotStringifyValue?: boolean;
    }
}

export const CurlParameter: React.FC<CurlParameter.Props> = ({ paramKey, value, doNotStringifyValue = false }) => {
    return (
        <>
            <span className="text-text-default">{paramKey}</span>
            {value != null && (
                <>
                    {" "}
                    {doNotStringifyValue ? (
                        <span className="text-text-default">{value}</span>
                    ) : (
                        <JsonExampleString value={value} />
                    )}
                </>
            )}
        </>
    );
};
