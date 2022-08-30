import { File } from "./File";
import { GeneratorContext } from "./GeneratorContext";

export interface DeclarationHandler<T> {
    run: (declaration: T, args: DeclarationHandlerArgs) => void | Promise<void>;
}

export interface DeclarationHandlerArgs {
    withFile: (run: (file: File) => void | Promise<void>) => Promise<void>;
    context: GeneratorContext;
}
