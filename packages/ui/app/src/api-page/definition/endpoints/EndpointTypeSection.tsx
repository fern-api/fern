import { FernRegistry } from "@fern-fern/registry";
import { EnglishTypeSummary } from "../types/english-type-summary/EnglishTypeSummary";
import { EndpointSection } from "./EndpointSection";

export declare namespace EndpointTypeSection {
    export interface Props {
        title: string;
        preamble: string;
        httpBody: FernRegistry.HttpBody;
    }
}

export const EndpointTypeSection: React.FC<EndpointTypeSection.Props> = ({ title, httpBody, preamble }) => {
    return (
        <EndpointSection title={title} titleRightText="map<RemoteGenTaskId, Task>">
            {httpBody.description != null && <div className="text-gray-500 mb-2">{httpBody.description}</div>}
            {httpBody.type._visit({
                object: () => null,
                reference: (type) => (
                    <div className="flex flex-wrap items-center leading-7 max-w-xl">
                        <span className="mr-1">{preamble}</span>
                        <EnglishTypeSummary type={type} includeReferencedTypeSummary isEndOfSentence />
                    </div>
                ),
                _other: () => null,
            })}
            {httpBody.type._visit({
                object: () => <div>properties</div>,
                reference: () => null,
                _other: () => null,
            })}
        </EndpointSection>
    );
};
