import { FernRegistry } from "@fern-fern/registry";
import { TypeDefinitionDetails } from "../types/TypeDefinitionDetails";
import { TypePreview } from "../types/TypePreview";
import { EndpointSection } from "./EndpointSection";

export declare namespace EndpointTypeSection {
    export interface Props {
        title: string;
        type: FernRegistry.Type;
    }
}

export const EndpointTypeSection: React.FC<EndpointTypeSection.Props> = ({ title, type }) => {
    return (
        <EndpointSection title={title} docs="Here is some text about the request body.">
            <TypeDefinitionDetails
                typeDefinition={type}
                defaultIsCollapsed={false}
                fallback={<TypePreview type={type} />}
            />
        </EndpointSection>
    );
};
