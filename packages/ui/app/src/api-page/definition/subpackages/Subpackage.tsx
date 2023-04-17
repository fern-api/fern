import { FernRegistry } from "@fern-fern/registry";
import { Endpoint } from "../endpoints/Endpoint";

export declare namespace Subpackage {
    export interface Props {
        subpackage: FernRegistry.ApiDefinitionSubpackage;
    }
}

export const Subpackage: React.FC<Subpackage.Props> = ({ subpackage }) => {
    return (
        <div className="min-h-0 overflow-y-auto">
            {subpackage.endpoints.map((endpoint) => (
                <div key={endpoint.id} className="flex-1 flex pb-36 min-w-0">
                    <Endpoint endpoint={endpoint} />
                </div>
            ))}
        </div>
    );
};
