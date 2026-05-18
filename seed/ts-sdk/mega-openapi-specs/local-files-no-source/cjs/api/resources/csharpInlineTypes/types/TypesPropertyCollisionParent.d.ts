import type * as SeedApi from "../../../index.js";
export interface TypesPropertyCollisionParent {
    /** This property collides with the default nested class name "Types" */
    types: string;
    /** This inline child should be nested inside InnerTypes instead of Types */
    child: SeedApi.csharpInlineTypes.TypesPropertyCollisionChild;
}
