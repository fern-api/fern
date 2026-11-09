/** Every var name any docs profile defines. The CLI leaves these for the renderer to fill per page. */
export function getProfileVarNames(
    profiles: Record<string, { vars?: Record<string, string> | string | string[] | undefined }> | undefined
): Set<string> {
    return new Set(
        Object.values(profiles ?? {}).flatMap((profile) =>
            profile.vars == null || typeof profile.vars === "string" || Array.isArray(profile.vars)
                ? []
                : Object.keys(profile.vars)
        )
    );
}
