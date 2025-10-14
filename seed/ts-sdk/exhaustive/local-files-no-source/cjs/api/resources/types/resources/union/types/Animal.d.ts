import type * as SeedExhaustive from "../../../../../index.js";
export type Animal = SeedExhaustive.types.Animal.Dog | SeedExhaustive.types.Animal.Cat;
export declare namespace Animal {
    interface Dog extends SeedExhaustive.types.Dog {
        animal: "dog";
    }
    interface Cat extends SeedExhaustive.types.Cat {
        animal: "cat";
    }
}
