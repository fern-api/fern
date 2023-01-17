import { GeneratedGenericAPIError } from "@fern-typescript/contexts";
import { GeneratedGenericAPIErrorImpl } from "./GeneratedGenericAPIErrorImpl";

export declare namespace GenericAPIErrorGenerator {
    export namespace generateGenericAPIError {
        export interface Args {
            errorClassName: string;
        }
    }
}

export class GenericAPIErrorGenerator {
    public generateGenericAPIError({
        errorClassName,
    }: GenericAPIErrorGenerator.generateGenericAPIError.Args): GeneratedGenericAPIError {
        return new GeneratedGenericAPIErrorImpl({ errorClassName });
    }
}
