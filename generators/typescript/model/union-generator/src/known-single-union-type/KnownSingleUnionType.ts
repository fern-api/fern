import { ModelContext } from "@fern-typescript/contexts";

import { ParsedSingleUnionType } from "../parsed-single-union-type/ParsedSingleUnionType.js";

export interface KnownSingleUnionType<Context extends ModelContext> extends ParsedSingleUnionType<Context> {
    getDiscriminantValue: () => string | number;
}
