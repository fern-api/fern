import { FernRegistry } from "@fern-fern/registry";
import { AllReferencedTypes } from "../types/AllReferencedTypes";
import { TypeDefinition } from "../types/TypeDefinition";

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
                object: (object) => (
                    <TypeDefinition typeShape={FernRegistry.TypeShape.object(object)} isCollapsible={false} />
                ),
                reference: (type) => <AllReferencedTypes type={type} isCollapsible={false} />,
                _other: () => null,
            })}
        </div>
    );
};
