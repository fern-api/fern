import { GeneratedTimeoutSdkError } from "@fern-typescript/contexts";

import { GeneratedTimeoutSdkErrorImpl } from "./GeneratedTimeoutSdkErrorImpl";

export declare namespace TimeoutSdkErrorGenerator {
    export namespace generateTimeoutSdkError {
        export interface Args {
            errorClassName: string;
        }
    }
}

export class TimeoutSdkErrorGenerator {
    public generateTimeoutSdkError({
        errorClassName
    }: TimeoutSdkErrorGenerator.generateTimeoutSdkError.Args): GeneratedTimeoutSdkError {
        return new GeneratedTimeoutSdkErrorImpl({ errorClassName });
    }
}
