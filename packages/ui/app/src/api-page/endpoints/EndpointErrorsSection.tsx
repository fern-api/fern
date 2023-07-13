import { FernRegistry } from "@fern-fern/registry-browser";
import { TypeDefinition } from "../types/type-definition/TypeDefinition";

// TODO: Replace this with the real error type
interface FakeError {
    id: string;
    status: string;
    description: string;
    type: FernRegistry.api.v1.read.TypeShape;
}

export declare namespace EndpointErrorsSection {
    export interface Props {
        errors: FakeError[];
    }
}

export const EndpointErrorsSection: React.FC<EndpointErrorsSection.Props> = ({ errors }) => {
    return (
        <div>
            {errors.map((e) => (
                <div className="border-border bg-yellow-8000 space flex flex-col items-start border-b py-3" key={e.id}>
                    <div className="rounded bg-red-500/10 p-1 font-mono text-sm text-red-400">{e.status}</div>
                    <div className="text-text-default mt-3 text-base">{e.description}</div>
                    <TypeDefinition typeShape={e.type} isCollapsible />
                </div>
            ))}
        </div>
    );
};
