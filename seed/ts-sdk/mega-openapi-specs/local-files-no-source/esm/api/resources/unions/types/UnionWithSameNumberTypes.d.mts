import type * as SeedApi from "../../../index.mjs";
export type UnionWithSameNumberTypes = SeedApi.unions.UnionWithSameNumberTypes.PositiveInt | SeedApi.unions.UnionWithSameNumberTypes.NegativeInt | SeedApi.unions.UnionWithSameNumberTypes.AnyNumber;
export declare namespace UnionWithSameNumberTypes {
    interface PositiveInt {
        type: "positiveInt";
        value?: number | undefined;
    }
    interface NegativeInt {
        type: "negativeInt";
        value?: number | undefined;
    }
    interface AnyNumber {
        type: "anyNumber";
        value?: number | undefined;
    }
}
