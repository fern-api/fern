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
                "rounded-sm px-1 mx-px whitespace-nowrap",
                "bg-[#323246] text-[#969CEE]",
                "dark:bg-[#323246] dark:text-[#969CEE]"
            )}
        >
            :{pathParameter}
        </span>
    );
};
