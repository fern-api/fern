import type { Cat as CatType } from "./Cat.js";
import type { Dog as DogType } from "./Dog.js";
export type Animal = Animal.Dog | Animal.Cat;
export declare namespace Animal {
    interface Dog extends DogType {
        animal: "dog";
    }
    interface Cat extends CatType {
        animal: "cat";
    }
}
