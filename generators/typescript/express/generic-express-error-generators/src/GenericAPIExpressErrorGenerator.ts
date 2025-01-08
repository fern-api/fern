import { GeneratedGenericAPIExpressError } from "@fern-typescript/contexts";

import { GeneratedGenericAPIExpressErrorImpl } from "./GeneratedGenericAPIExpressErrorImpl";

export declare namespace GenericAPIExpressErrorGenerator {
    export namespace generateGenericAPIExpressError {
        export interface Args {
            errorClassName: string;
        }
    }
}

export class GenericAPIExpressErrorGenerator {
    public generateGenericAPIExpressError({
        errorClassName
    }: GenericAPIExpressErrorGenerator.generateGenericAPIExpressError.Args): GeneratedGenericAPIExpressError {
        return new GeneratedGenericAPIExpressErrorImpl({ errorClassName });
    }
}
