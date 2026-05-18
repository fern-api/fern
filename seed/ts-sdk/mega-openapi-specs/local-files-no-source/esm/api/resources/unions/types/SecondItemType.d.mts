export interface SecondItemType {
    type?: (SecondItemType.Type | null) | undefined;
    title: string;
}
export declare namespace SecondItemType {
    const Type: {
        readonly SecondItemType: "secondItemType";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
