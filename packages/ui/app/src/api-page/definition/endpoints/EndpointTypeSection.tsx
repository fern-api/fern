import { FernRegistry } from "@fern-fern/registry";
import { EnglishTypeReferenceSummary } from "../types/english-summary/EnglishTypeReferenceSummary";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";
import { TypeReferenceTree } from "../types/TypeReferenceTree";
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
        <EndpointSection
            title={title}
            titleRightText={httpBody.type._visit<JSX.Element | string | undefined>({
                object: () => "object",
                reference: (type) => (
                    <div className="flex items-center">
                        <TypeShorthand type={type} />
                    </div>
                ),
                _other: () => undefined,
            })}
        >
            {httpBody.description != null && <div className="text-gray-500 mb-2">{httpBody.description}</div>}
            {httpBody.type._visit({
                object: () => null,
                reference: (type) => {
                    return (
                        <div className="flex flex-wrap items-center leading-7 max-w-xl mb-3">
                            <span className="mr-1">{preamble}</span>
                            <EnglishTypeReferenceSummary type={type} isEndOfSentence />
                        </div>
                    );
                },
                _other: () => null,
            })}
            {httpBody.type._visit({
                object: () => <div>properties</div>,
                reference: (type) => <TypeReferenceTree type={type} />,
                _other: () => null,
            })}
        </EndpointSection>
    );
};
