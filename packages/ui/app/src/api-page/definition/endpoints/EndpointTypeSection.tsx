import { FernRegistry } from "@fern-fern/registry";
import { TypeDefinition } from "../types/TypeDefinition";
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
            <TypeDefinition typeDefinition={type} defaultIsCollapsed={false} />
        </EndpointSection>
    );
};
