import { FernRegistry } from "@fern-fern/registry-browser";
import classNames from "classnames";
import { type JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";

export declare namespace EndpointErrorsSection {
    export interface Props {
        errors: FernRegistry.api.v1.read.ErrorDeclaration[];
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        onClickError: (e: FernRegistry.api.v1.read.ErrorDeclaration, index: number) => void;
        selectedErrorIndex: number | null;
    }
}

export const EndpointErrorsSection: React.FC<EndpointErrorsSection.Props> = ({
    errors,
    selectedErrorIndex,
    onHoverProperty,
    onClickError,
}) => {
    return (
        <div className="border-border flex flex-col overflow-hidden rounded-md border">
            {errors.map((e, idx) => {
                return (
                    <button
                        key={idx}
                        className={classNames("space flex hover:bg-neutral-800/40 flex-col items-start px-3 py-3", {
                            "bg-neutral-800/60": idx === selectedErrorIndex,
                            "border-border border-b": idx !== errors.length - 1,
                        })}
                        onClick={() => onClickError(e, idx)}
                    >
                        <div className="rounded bg-red-500/20 p-1 text-xs text-red-400">{e.statusCode}</div>
                        <div className="text-text-default mt-3 text-start text-base">{e.description}</div>
                        {idx === selectedErrorIndex && (
                            <div className="text-start">
                                {e.type != null && (
                                    <TypeReferenceDefinitions
                                        isCollapsible={false}
                                        type={e.type}
                                        onHoverProperty={onHoverProperty}
                                    />
                                )}
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
