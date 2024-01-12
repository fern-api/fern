import { AstNode } from "../AstNode";
import { ExternalDependency } from "../ExternalDependency";

// Note a gemspec for us is just a Ruby class and we configure
// the spec variable
export class Gemspec extends AstNode {
    public dependencies: ExternalDependency[];
}
