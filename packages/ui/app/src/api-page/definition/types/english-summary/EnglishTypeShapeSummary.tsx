import { FernRegistry } from "@fern-fern/registry";
import { EnglishTypeReferenceSummary } from "./EnglishTypeReferenceSummary";

export declare namespace EnglishTypeShapeSummary {
    export interface Props {
        shape: FernRegistry.TypeShape;
    }
}

export const EnglishTypeShapeSummary: React.FC<EnglishTypeShapeSummary.Props> = ({ shape }) => {
    return (
        <>
            {shape._visit<JSX.Element | string>({
                alias: (type) => <EnglishTypeReferenceSummary type={type} isEndOfSentence />,
                object: () => "an object.",
                undiscriminatedUnion: () => "a union.",
                discriminatedUnion: () => "a union.",
                enum: () => "an enum.",
                _other: () => "<unknown>.",
            })}
        </>
    );
};
