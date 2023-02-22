import classNames from "classnames";
import { useMemo } from "react";

export declare namespace ExampleDot {
    export interface Props {
        index: number;
        isSelected: boolean;
        setSelectedIndex: (index: number) => void;
    }
}

export const ExampleDot: React.FC<ExampleDot.Props> = ({ index, isSelected, setSelectedIndex }) => {
    const handleClick = useMemo(
        () =>
            isSelected
                ? undefined
                : () => {
                      setSelectedIndex(index);
                  },
        [index, isSelected, setSelectedIndex]
    );

    return (
        <div
            className={classNames(
                "rounded-full w-2.5 h-2.5 border border-green-700",
                isSelected ? "bg-green-700" : "bg-slate-200",
                {
                    "cursor-pointer": handleClick != null,
                }
            )}
            onClick={handleClick}
        />
    );
};
