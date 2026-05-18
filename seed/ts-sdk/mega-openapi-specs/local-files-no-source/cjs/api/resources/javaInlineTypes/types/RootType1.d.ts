import type * as SeedApi from "../../../index.js";
/**
 * lorem ipsum
 */
export interface RootType1 {
    /** lorem ipsum */
    foo: string;
    /** lorem ipsum */
    bar: SeedApi.javaInlineTypes.RootType1InlineType1;
    /** lorem ipsum */
    fooMap: Record<string, SeedApi.javaInlineTypes.RootType1FooMapValue>;
    /** lorem ipsum */
    fooList: SeedApi.javaInlineTypes.RootType1FooListItem[];
    /** lorem ipsum */
    fooSet: SeedApi.javaInlineTypes.RootType1FooSetItem[];
    /** lorem ipsum */
    ref: SeedApi.javaInlineTypes.ReferenceType;
}
