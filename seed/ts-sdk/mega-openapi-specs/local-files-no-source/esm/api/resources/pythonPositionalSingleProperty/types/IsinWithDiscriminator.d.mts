export interface IsinWithDiscriminator {
    isin: string;
    type: IsinWithDiscriminator.Type;
}
export declare namespace IsinWithDiscriminator {
    const Type: {
        readonly Isin: "ISIN";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
