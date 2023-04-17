import { FernRegistry } from "@fern-fern/registry";
import { AllReferencedTypes } from "../types/AllReferencedTypes";
import { ObjectDefinition } from "../types/object/ObjectDefinition";

export declare namespace EndpointTypeSection {
    export interface Props {
        httpBody: FernRegistry.HttpBody;
    }
}

export const EndpointTypeSection: React.FC<EndpointTypeSection.Props> = ({ httpBody }) => {
    return (
        <div className="flex flex-col">
            {httpBody.description != null && <div className="text-gray-500 mb-2">{httpBody.description}</div>}
            {httpBody.type._visit({
                object: (object) => <ObjectDefinition object={object} />,
                reference: (type) => <AllReferencedTypes type={type} isCollapsible={false} />,
                _other: () => null,
            })}
        </div>
    );
};
