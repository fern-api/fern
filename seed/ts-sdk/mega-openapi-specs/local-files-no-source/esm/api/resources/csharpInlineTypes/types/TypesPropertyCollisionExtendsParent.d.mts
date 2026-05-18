import type * as SeedApi from "../../../index.mjs";
export interface TypesPropertyCollisionExtendsParent extends SeedApi.csharpInlineTypes.TypesPropertyCollisionBaseParent {
    /** This inline child should be nested inside InnerTypes since "Types" is inherited */
    child: SeedApi.csharpInlineTypes.TypesPropertyCollisionExtendsChild;
}
