export interface MultipleDiscriminators {
    value: string;
    type: MultipleDiscriminators.Type;
    version: MultipleDiscriminators.Version;
}
export declare namespace MultipleDiscriminators {
    const Type: {
        readonly TypeA: "TYPE_A";
    };
    type Type = (typeof Type)[keyof typeof Type];
    const Version: {
        readonly V1: "v1";
    };
    type Version = (typeof Version)[keyof typeof Version];
}
