import { Class_ } from "../Class_";

export declare namespace SerializableObject {
    export type Init = Omit<Class_.Init, "functions" | "includeInitializer" | "expressions">;
}
export class SerializableObject extends Class_ {
    constructor(init: SerializableObject.Init) {
        // TODO: Create these functions
        const fromJsonFunction = null;
        const toJsonFunction = null;
        super({ functions: [fromJsonFunction, toJsonFunction], includeInitializer: true, ...init });
    }
}
