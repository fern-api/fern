import { JsonListItem } from "./JsonListItem";

export interface JsonListItems {
    items: unknown[];
}

export const JsonListItems: React.FC<JsonListItems> = ({ items }) => {
    return (
        <>
            {items.map((item, index) => (
                <JsonListItem
                    key={index}
                    list={items}
                    index={index}
                    item={item}
                    isLastItem={index === items.length - 1}
                />
            ))}
        </>
    );
};
