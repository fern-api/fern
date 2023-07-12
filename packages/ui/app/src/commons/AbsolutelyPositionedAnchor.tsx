import { LinkIcon } from "./icons/LinkIcon";

export declare namespace AbsolutelyPositionedAnchor {
    export interface Props {
        anchor: string;
    }
}

/**
 * Can only be used with a parent div that has `position` set to `"relative"`.
 */
export const AbsolutelyPositionedAnchor: React.FC<AbsolutelyPositionedAnchor.Props> = ({ anchor }) => {
    return (
        <div
            // eslint-disable-next-line
            className="absolute -left-[calc(0.875rem+0.5rem*2)] top-2.5 flex items-center justify-center px-2 py-1 opacity-0 hover:opacity-100 group-hover:opacity-100"
        >
            <a href={`#${anchor}`}>
                <LinkIcon className="text-text-muted hover:text-text-stark h-3.5 w-3.5 transition" />
            </a>
        </div>
    );
};
