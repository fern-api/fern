import classNames from "classnames";

export declare namespace ApiEmoji {
    export interface Props {
        emoji: string | undefined;
        className?: string;
    }
}

export const ApiEmoji: React.FC<ApiEmoji.Props> = ({ emoji, className }) => {
    return (
        <div
            className={classNames(
                className,
                "flex justify-center items-center bg-neutral-200 border border-gray-300 rounded w-9 h-9 text-2xl select-none"
            )}
        >
            {emoji}
        </div>
    );
};
