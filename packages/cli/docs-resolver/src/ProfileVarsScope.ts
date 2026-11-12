import type { AbsoluteFilePath } from "@fern-api/fs-utils";

export interface ProfileVarsScope {
    /**
     * The scope profile's values for the names a nav node uses: in `texts` (its title, subtitle) or in
     * the page at `absolutePath`. `pageProfile` replaces the scope's profile. The renderer fills them.
     */
    forNode(args: { texts?: (string | undefined)[]; absolutePath?: AbsoluteFilePath; pageProfile?: string }): {
        profileVars?: Record<string, string>;
    };
}

export const NO_PROFILE_VARS: ProfileVarsScope = { forNode: () => ({}) };
