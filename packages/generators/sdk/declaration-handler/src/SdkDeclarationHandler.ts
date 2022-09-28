import { GeneratorContext } from "./GeneratorContext";
import { SdkFile } from "./SdkFile";

export interface SdkDeclarationHandler<T, Args = SdkDeclarationHandler.Args> {
    run: (declaration: T, args: Args) => void | Promise<void>;
}

export declare namespace SdkDeclarationHandler {
    interface Args {
        file: SdkFile;
        exportedName: string;
        context: GeneratorContext;
    }
}
