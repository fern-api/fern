export declare namespace EndpointPathParameter {
    export interface Props {
        pathParameter: string;
    }
}

export const EndpointPathParameter: React.FC<EndpointPathParameter.Props> = ({ pathParameter }) => {
    return (
        <span className="bg-gray-100 border border-gray-300 text-bold rounded px-1 mx-px whitespace-nowrap">
            :{pathParameter}
        </span>
    );
};
