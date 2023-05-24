export type JsonPropertyPath = readonly JsonPropertyPathPart[];

export type JsonPropertyPathPart =
    | JsonPropertyPathPart.ObjectProperty
    | JsonPropertyPathPart.ObjectFilter
    | JsonPropertyPathPart.ListItem;

export declare namespace JsonPropertyPathPart {
    export interface ObjectProperty {
        type: "objectProperty";
        // if absent, any property is matched
        propertyName?: string;
    }

    export interface ObjectFilter {
        type: "objectFilter";
        propertyName: string;
        requiredValue: string;
    }

    export interface ListItem {
        type: "listItem";
        // if absent, any item is matched
        index?: number;
    }
}
