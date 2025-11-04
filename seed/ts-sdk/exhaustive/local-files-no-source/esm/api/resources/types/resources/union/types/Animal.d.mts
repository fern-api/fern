import type { Cat as Cat_SeedExhaustive } from "./Cat.mjs";
import type { Dog as Dog_SeedExhaustive } from "./Dog.mjs";
export type Animal = Animal.Dog | Animal.Cat;
export declare namespace Animal {
    interface Dog extends Dog_SeedExhaustive {
        animal: "dog";
    }
    interface Cat extends Cat_SeedExhaustive {
        animal: "cat";
    }
}
