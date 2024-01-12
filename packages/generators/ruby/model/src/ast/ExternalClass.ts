import { ClassReference } from "./ClassReference";
import { ExternalDependency } from "./ExternalDependency";

export declare namespace ExternalClassReference {
    export interface Init extends ClassReference.Init {
        dependency: ExternalDependency;
    }
}

export class ExternalClassReference extends ClassReference {
    public dependency: ExternalDependency;

    constructor({ dependency, ...rest }: ExternalClassReference.Init) {
        super(rest);
        this.dependency = dependency;
    }

    public writeInternal(startingTabSpaces: number): string {
        throw new Error("Method writeInternal not implemented for ExternalClassReference");
    }
}
