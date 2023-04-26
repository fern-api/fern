import { FernRegistry } from "@fern-fern/registry";
import { SubpackageContextProvider } from "./context/SubpackageContextProvider";
import { SubpackageEndpoint } from "./SubpackageEndpoint";

export declare namespace Subpackage {
    export interface Props {
        subpackageId: FernRegistry.SubpackageId;
        subpackage: FernRegistry.ApiDefinitionSubpackage;
    }
}

export const Subpackage: React.FC<Subpackage.Props> = ({ subpackageId, subpackage }) => {
    return (
        <SubpackageContextProvider subpackageId={subpackageId}>
            <div className="min-h-0 overflow-y-auto">
                {subpackage.endpoints.map((endpoint) => (
                    <div key={endpoint.id} className="flex-1 flex pb-36 min-w-0">
                        <SubpackageEndpoint subpackageId={subpackageId} endpoint={endpoint} />
                    </div>
                ))}
            </div>
        </SubpackageContextProvider>
    );
};
