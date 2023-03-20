import { FernRegistry } from "@fern-fern/registry";
import { EnglishTypeSummary } from "../types/english-type-summary/EnglishTypeSummary";
import { EndpointSection } from "./EndpointSection";

export declare namespace EndpointTypeSection {
    export interface Props {
        title: string;
        typeSummaryLabel: string;
        type: FernRegistry.Type;
    }
}

export const EndpointTypeSection: React.FC<EndpointTypeSection.Props> = ({ title, type, typeSummaryLabel }) => {
    return (
        <EndpointSection title={title}>
            <div className="text-gray-500 mb-2">Here are some docs about this request. Lorem ipsum here we go!</div>
            <div className="flex flex-wrap items-center leading-7">
                The {typeSummaryLabel} for this endpoint is&nbsp;
                <EnglishTypeSummary type={type} includeReferencedTypeSummary isEndOfSentence />
            </div>
            {type._visit({
                object: () => <div>object</div>,
                reference: () => null,
                enum: () => null,
                union: () => null,
                discriminatedUnion: () => null,
                primitive: () => null,
                optional: () => null,
                list: () => null,
                set: () => null,
                map: () => null,
                unknown: () => null,
                _other: () => null,
            })}
        </EndpointSection>
    );
};
