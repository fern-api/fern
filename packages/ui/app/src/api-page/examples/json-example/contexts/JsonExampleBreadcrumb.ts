export type JsonExampleBreadcrumb = JsonExampleBreadcrumb.ObjectProperty | JsonExampleBreadcrumb.ListItem;

export declare namespace JsonExampleBreadcrumb {
    export interface ObjectProperty {
        type: "objectProperty";
        object: object;
        propertyName: string;
    }

    export interface ListItem {
        type: "listItem";
        list: unknown[];
        index: number;
    }
}
