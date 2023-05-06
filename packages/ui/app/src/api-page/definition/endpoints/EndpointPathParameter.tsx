import classNames from "classnames";

export declare namespace EndpointPathParameter {
    export interface Props {
        pathParameter: string;
    }
}

export const EndpointPathParameter: React.FC<EndpointPathParameter.Props> = ({ pathParameter }) => {
    return (
        <span
            className={classNames(
                "border text-bold rounded px-1 mx-px whitespace-nowrap",
                "bg-gray-100 border-gray-300",
                "dark:bg-gray-800 border-gray-600"
            )}
        >
            :{pathParameter}
        </span>
    );
};
