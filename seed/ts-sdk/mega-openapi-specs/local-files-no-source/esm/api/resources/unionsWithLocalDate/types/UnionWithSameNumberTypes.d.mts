import type * as SeedApi from "../../../index.mjs";
export type UnionWithSameNumberTypes = SeedApi.unionsWithLocalDate.UnionWithSameNumberTypes.PositiveInt | SeedApi.unionsWithLocalDate.UnionWithSameNumberTypes.NegativeInt | SeedApi.unionsWithLocalDate.UnionWithSameNumberTypes.AnyNumber;
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
