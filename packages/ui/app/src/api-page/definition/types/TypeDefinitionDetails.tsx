import { FernRegistry } from "@fern-fern/registry";

export declare namespace TypeDefinitionDetails {
    export interface Props {
        type: FernRegistry.TypeReference;
        defaultIsCollapsed: boolean;
        className?: string;
        fallback?: JSX.Element;
    }
}

export const TypeDefinitionDetails: React.FC<TypeDefinitionDetails.Props> = () => {
    return <div>TODO</div>;
};
