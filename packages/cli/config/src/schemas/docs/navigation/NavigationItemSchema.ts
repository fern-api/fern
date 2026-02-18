import { z } from "zod";
import { ApiReferenceConfigurationSchema } from "./ApiReferenceConfigurationSchema.js";
import { ChangelogConfigurationSchema } from "./ChangelogConfigurationSchema.js";
import { FolderConfigurationSchema } from "./FolderConfigurationSchema.js";
import { LibraryReferenceConfigurationSchema } from "./LibraryReferenceConfigurationSchema.js";
import { LinkConfigurationSchema } from "./LinkConfigurationSchema.js";
import { PageConfigurationSchema } from "./PageConfigurationSchema.js";
import { _injectNavigationItemSchema, SectionConfigurationSchema } from "./SectionConfigurationSchema.js";

/**
 * NavigationItem is the recursive union type for docs navigation.
 *
 * Navigation items are discriminated by key presence (not a `type` field):
 * - `page` -> PageConfigurationSchema
 * - `section` -> SectionConfigurationSchema (recursive)
 * - `api` -> ApiReferenceConfigurationSchema
 * - `link` -> LinkConfigurationSchema
 * - `changelog` -> ChangelogConfigurationSchema
 * - `library` -> LibraryReferenceConfigurationSchema
 * - `folder` -> FolderConfigurationSchema
 *
 * We define the TS type explicitly because z.infer cannot resolve z.lazy types.
 */
export type NavigationItem =
    | z.infer<typeof PageConfigurationSchema>
    | z.infer<typeof SectionConfigurationSchema>
    | z.infer<typeof ApiReferenceConfigurationSchema>
    | z.infer<typeof LinkConfigurationSchema>
    | z.infer<typeof ChangelogConfigurationSchema>
    | z.infer<typeof LibraryReferenceConfigurationSchema>
    | z.infer<typeof FolderConfigurationSchema>;

export const NavigationItemSchema: z.ZodType<NavigationItem> = z.lazy(() =>
    z.union([
        PageConfigurationSchema,
        SectionConfigurationSchema,
        ApiReferenceConfigurationSchema,
        LinkConfigurationSchema,
        ChangelogConfigurationSchema,
        LibraryReferenceConfigurationSchema,
        FolderConfigurationSchema
    ])
);

// Wire up the circular reference: SectionConfigurationSchema.contents uses NavigationItemSchema.
_injectNavigationItemSchema(NavigationItemSchema);
