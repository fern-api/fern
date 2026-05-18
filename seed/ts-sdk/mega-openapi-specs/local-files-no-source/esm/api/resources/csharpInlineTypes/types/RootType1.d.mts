import type * as SeedApi from "../../../index.mjs";
/**
 * lorem ipsum
 */
export interface RootType1 {
    /** lorem ipsum */
    foo: string;
    /** lorem ipsum */
    bar: SeedApi.csharpInlineTypes.RootType1InlineType1;
    /** lorem ipsum */
    fooMap: Record<string, SeedApi.csharpInlineTypes.RootType1FooMapValue>;
    /** lorem ipsum */
    fooList: SeedApi.csharpInlineTypes.RootType1FooListItem[];
    /** lorem ipsum */
    fooSet: SeedApi.csharpInlineTypes.RootType1FooSetItem[];
    /** lorem ipsum */
    ref: SeedApi.csharpInlineTypes.ReferenceType;
}
