import type { Cat as Cat_SeedExhaustive } from "./Cat.js";
import type { Dog as Dog_SeedExhaustive } from "./Dog.js";
export type Animal = Animal.Dog | Animal.Cat;
export declare namespace Animal {
    interface Dog extends Dog_SeedExhaustive {
        animal: "dog";
    }
    interface Cat extends Cat_SeedExhaustive {
        animal: "cat";
    }
}
