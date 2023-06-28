export declare namespace SearchHit {
    export interface Props {
        hit: {
            objectID: string;
            property_name: string;
            description: string;
            location: string;
        };
    }
}

export const SearchHit: React.FC<SearchHit.Props> = (providedProps) => {
    const { property_name: propertyName, description } = providedProps.hit;

    return (
        <button className="hover:bg-accentPrimary group flex w-full flex-col space-y-1 rounded-md p-2">
            <div className="text-text-default text-start group-hover:text-white">{propertyName}</div>
            <div className="text-text-default text-start group-hover:text-white">{description}</div>
        </button>
    );
};
