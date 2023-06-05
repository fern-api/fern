export declare namespace JsonExampleString {
    export interface Props {
        value: string;
        doNotAddQuotes?: boolean;
    }
}

export const JsonExampleString: React.FC<JsonExampleString.Props> = ({ value, doNotAddQuotes = false }) => {
    return <span className="text-[#94d199]">{doNotAddQuotes ? value : `"${value}"`}</span>;
};
