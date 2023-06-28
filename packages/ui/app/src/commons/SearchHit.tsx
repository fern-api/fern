import { Highlight } from "react-instantsearch-hooks-web";

export declare namespace SearchHit {
    export interface Props {
        // TODO: Needs to be imported from our sdk
        hit: {
            __position: number;
            objectID: string;
            property_name: string;
            description: string;
            location: string;
        };
    }
}

export const SearchHit: React.FC<SearchHit.Props> = (providedProps) => {
    const { hit } = providedProps;

    return (
        <button className="hover:bg-accentPrimary group flex w-full flex-col space-y-1 rounded-md p-2">
            <div className="flex flex-col items-start">
                <Highlight
                    className="text-text-default text-start group-hover:text-white"
                    attribute="property_name"
                    hit={hit}
                />
            </div>
            <div className="flex flex-col items-start">
                <Highlight
                    className="text-text-default text-start group-hover:text-white"
                    attribute="description"
                    hit={hit}
                />
            </div>
        </button>
    );
};
