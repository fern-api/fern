// this is the parsed config shape. to view the allowed options for generators.yml,
// see ExpressCustomConfigSchema.ts
export interface ExpressCustomConfig {
    useBrandedStringAliases: boolean;
    areImplementationsOptional: boolean;
    doNotHandleUnrecognizedErrors: boolean;
    includeUtilsOnUnionMembers: boolean;
    includeOtherInUnionTypes: boolean;
    treatUnknownAsAny: boolean;
    noSerdeLayer: boolean;
    outputEsm: boolean;
    outputSourceFiles: boolean;
}
