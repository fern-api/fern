import { GeneratedGenericAPISdkError } from "@fern-typescript/contexts";

import { GeneratedGenericAPISdkErrorImpl } from "./GeneratedGenericAPISdkErrorImpl.js";

export declare namespace GenericAPISdkErrorGenerator {
    export interface Init {
        requestIdHeader?: string;
    }

    export namespace generateGenericAPISdkError {
        export interface Args {
            errorClassName: string;
        }
    }
}

export class GenericAPISdkErrorGenerator {
    private readonly requestIdHeader: string | undefined;

    constructor({ requestIdHeader }: GenericAPISdkErrorGenerator.Init = {}) {
        this.requestIdHeader = requestIdHeader;
    }

    public generateGenericAPISdkError({
        errorClassName
    }: GenericAPISdkErrorGenerator.generateGenericAPISdkError.Args): GeneratedGenericAPISdkError {
        return new GeneratedGenericAPISdkErrorImpl({ errorClassName, requestIdHeader: this.requestIdHeader });
    }
}
