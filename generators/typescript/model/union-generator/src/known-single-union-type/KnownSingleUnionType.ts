import { ModelContext } from "@fern-typescript/contexts";

import { ParsedSingleUnionType } from "../parsed-single-union-type/ParsedSingleUnionType";

export interface KnownSingleUnionType<Context extends ModelContext> extends ParsedSingleUnionType<Context> {
    getDiscriminantValue: () => string | number;
}
