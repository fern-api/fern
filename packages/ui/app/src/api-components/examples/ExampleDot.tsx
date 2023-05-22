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
                "rounded-full w-2.5 h-2.5 border",
                isSelected ? "border-green-600 bg-[#68D4A6]" : "border-gray-400 bg-gray-200",
                {
                    "cursor-pointer": handleClick != null,
                }
            )}
            onClick={handleClick}
        />
    );
};
