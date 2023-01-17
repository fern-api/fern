import { GeneratedTimeoutError } from "@fern-typescript/contexts";
import { GeneratedTimeoutErrorImpl } from "./GeneratedTimeoutErrorImpl";

export declare namespace TimeoutErrorGenerator {
    export namespace generateTimeoutError {
        export interface Args {
            errorClassName: string;
        }
    }
}

export class TimeoutErrorGenerator {
    public generateTimeoutError({
        errorClassName,
    }: TimeoutErrorGenerator.generateTimeoutError.Args): GeneratedTimeoutError {
        return new GeneratedTimeoutErrorImpl({ errorClassName });
    }
}
