import { GeneratorContext } from "./GeneratorContext";
import { SdkFile } from "./SdkFile";

export interface SdkDeclarationHandler<T> {
    run: (declaration: T, args: SdkDeclarationHandler.Args) => void | Promise<void>;
}

export declare namespace SdkDeclarationHandler {
    interface Args {
        file: SdkFile;
        context: GeneratorContext;
    }
}
