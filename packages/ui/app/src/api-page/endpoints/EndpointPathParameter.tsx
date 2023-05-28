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
                "dark:bg-accentHighlight dark:text-accentPrimary"
            )}
        >
            :{pathParameter}
        </span>
    );
};
