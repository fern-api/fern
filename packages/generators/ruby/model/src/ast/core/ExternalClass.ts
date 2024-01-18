import { Class_ } from "./Class_";
import { ExternalDependency } from "./ExternalDependency";
import { Import } from "./Import";

export declare namespace ExternalClass {
    export interface Init extends Class_.Init {
        import_: Import;
        dependency: ExternalDependency;
    }
}

export class ExternalClass extends Class_ {
    public import_: Import;
    public dependency: ExternalDependency;

    constructor({ import_, dependency, ...rest }: ExternalClass.Init) {
        super(rest);
        this.import_ = import_;
        this.dependency = dependency;
    }

    public writeInternal(startingTabSpaces: number): string {
        throw new Error("Method writeInternal not implemented for ExternalClasses");
    }
}
