import { FernRegistry } from "@fern-fern/registry-browser";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";

export declare namespace EndpointErrorsSection {
    export interface Props {
        errors: FernRegistry.api.v1.read.ErrorDeclaration[];
    }
}

export const EndpointErrorsSection: React.FC<EndpointErrorsSection.Props> = ({ errors }) => {
    return (
        <div>
            {errors.map((e, idx) => (
                <div className="border-border bg-yellow-8000 space flex flex-col items-start border-b py-3" key={idx}>
                    <div className="rounded bg-red-500/10 p-1 font-mono text-sm text-red-400">{e.statusCode}</div>
                    <div className="text-text-default mt-3 text-base">{e.description}</div>
                    {e.type != null && <TypeReferenceDefinitions isCollapsible type={e.type} />}
                </div>
            ))}
        </div>
    );
};
