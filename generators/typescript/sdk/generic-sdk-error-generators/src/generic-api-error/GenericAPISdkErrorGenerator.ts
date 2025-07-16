import { GeneratedGenericAPISdkError } from "@fern-typescript/contexts";

import { GeneratedGenericAPISdkErrorImpl } from "./GeneratedGenericAPISdkErrorImpl";

export declare namespace GenericAPISdkErrorGenerator {
    export namespace generateGenericAPISdkError {
        export interface Args {
            errorClassName: string;
        }
    }
}

export class GenericAPISdkErrorGenerator {
    public generateGenericAPISdkError({
        errorClassName
    }: GenericAPISdkErrorGenerator.generateGenericAPISdkError.Args): GeneratedGenericAPISdkError {
        return new GeneratedGenericAPISdkErrorImpl({ errorClassName });
    }
}
