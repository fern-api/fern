import { JsonExampleString } from "../json-example/JsonExampleString";

export declare namespace CurlParameter {
    export interface Props {
        paramKey: string;
        value?: string;
    }
}

export const CurlParameter: React.FC<CurlParameter.Props> = ({ paramKey, value }) => {
    return (
        <>
            <span className="text-text-muted">{paramKey}</span>
            {value != null && (
                <>
                    {" "}
                    <JsonExampleString value={value} />
                </>
            )}
        </>
    );
};
