export type JsonPropertyPath = readonly JsonPropertyPathPart[];

export type JsonPropertyPathPart = JsonPropertyPathPart.ObjectProperty | JsonPropertyPathPart.ObjectFilter;

export declare namespace JsonPropertyPathPart {
    export interface ObjectProperty {
        type: "objectProperty";
        propertyName: string;
    }

    export interface ObjectFilter {
        type: "objectFilter";
        propertyName: string;
        requiredValue: string;
    }
}
