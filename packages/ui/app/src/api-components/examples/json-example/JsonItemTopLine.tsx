import { JsonExampleLine } from "./JsonExampleLine";
import { JsonItemTopLineContent } from "./JsonItemTopLineContent";

export declare namespace JsonItemTopLine {
    export interface Props {
        value: unknown;
        isNonLastItemInCollection: boolean;
    }
}

export const JsonItemTopLine: React.FC<JsonItemTopLine.Props> = ({ value, isNonLastItemInCollection }) => {
    return (
        <JsonExampleLine>
            <JsonItemTopLineContent value={value} isNonLastItemInCollection={isNonLastItemInCollection} />
        </JsonExampleLine>
    );
};
