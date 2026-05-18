import type * as SeedApi from "../../../index.mjs";
/**
 * Undiscriminated union with multiple object variants.
 * This reproduces the Pipedream issue where Emitter is a union of
 * DeployedComponent, HttpInterface, and TimerInterface.
 */
export type MyUnion = SeedApi.undiscriminatedUnionWithResponseProperty.MyUnion.A | SeedApi.undiscriminatedUnionWithResponseProperty.MyUnion.B | SeedApi.undiscriminatedUnionWithResponseProperty.MyUnion.C;
export declare namespace MyUnion {
    interface A extends SeedApi.undiscriminatedUnionWithResponseProperty.VariantA {
        type: "A";
    }
    interface B extends SeedApi.undiscriminatedUnionWithResponseProperty.VariantB {
        type: "B";
    }
    interface C extends SeedApi.undiscriminatedUnionWithResponseProperty.VariantC {
        type: "C";
    }
}
