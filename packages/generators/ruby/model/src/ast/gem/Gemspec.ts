import { Class_ } from "../classes/Class_";
import { ExternalDependency } from "../ExternalDependency";

// Note a gemspec for us is just a Ruby class and we configure
// the spec variable
export class Gemspec extends Class_ {
    public dependencies: ExternalDependency[];
}
