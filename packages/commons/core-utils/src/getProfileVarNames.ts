/** Every var name any docs profile defines. The CLI leaves these for the renderer to fill per page. */
export function getProfileVarNames(
    profiles: Record<string, { vars?: Record<string, string> | undefined }> | undefined
): Set<string> {
    return new Set(Object.values(profiles ?? {}).flatMap((profile) => Object.keys(profile.vars ?? {})));
}
