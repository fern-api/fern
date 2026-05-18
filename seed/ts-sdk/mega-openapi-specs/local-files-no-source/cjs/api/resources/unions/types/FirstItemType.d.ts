export interface FirstItemType {
    type?: (FirstItemType.Type | null) | undefined;
    name: string;
}
export declare namespace FirstItemType {
    const Type: {
        readonly FirstItemType: "firstItemType";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
