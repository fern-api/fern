import { FernRegistry } from "@fern-fern/registry";
import { PropertyTitle } from "../types/object/PropertyTitle";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        docs?: string;
        type: FernRegistry.Type;
    }
}

export const EndpointParameter: React.FC<EndpointParameter.Props> = ({ name, docs, type }) => {
    return (
        <div className="flex flex-col gap-y-5 ">
            <PropertyTitle name={name} type={type} />
            {docs != null && <div>{docs}</div>}
        </div>
    );
};
