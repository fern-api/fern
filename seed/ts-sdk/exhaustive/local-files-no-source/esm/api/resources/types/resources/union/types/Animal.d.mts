import type { Cat as SeedExhaustive_Cat } from "./Cat.mjs";
import type { Dog as SeedExhaustive_Dog } from "./Dog.mjs";
export type Animal = Animal.Dog | Animal.Cat;
export declare namespace Animal {
    interface Dog extends SeedExhaustive_Dog {
        animal: "dog";
    }
    interface Cat extends SeedExhaustive_Cat {
        animal: "cat";
    }
}
