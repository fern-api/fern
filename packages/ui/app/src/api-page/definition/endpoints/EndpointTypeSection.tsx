import { FernRegistry } from "@fern-fern/registry";
import { EnglishTypeReferenceSummary } from "../types/english-summary/EnglishTypeReferenceSummary";
import { AllReferencedTypes } from "./AllReferencedTypes";

export declare namespace EndpointTypeSection {
    export interface Props {
        preamble: string;
        httpBody: FernRegistry.HttpBody;
    }
}

export const EndpointTypeSection: React.FC<EndpointTypeSection.Props> = ({ httpBody, preamble }) => {
    return (
        <div className="flex flex-col">
            {httpBody.description != null && <div className="text-gray-500 mb-2">{httpBody.description}</div>}
            {httpBody.type._visit({
                object: () => null,
                reference: (type) => {
                    return (
                        <div className="border border-gray-300 rounded p-2 bg-[#f5f5f5] leading-7">
                            {preamble + " "}
                            <EnglishTypeReferenceSummary type={type} isEndOfSentence />
                        </div>
                    );
                },
                _other: () => null,
            })}
            {httpBody.type._visit({
                object: () => <div>properties</div>,
                reference: (type) => <AllReferencedTypes className="mt-5" type={type} />,
                _other: () => null,
            })}
        </div>
    );
};
