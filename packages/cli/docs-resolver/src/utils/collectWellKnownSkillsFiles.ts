import { AbsoluteFilePath, doesPathExist, getAllFilesInDirectory, join, RelativeFilePath } from "@fern-api/fs-utils";

/**
 * Docs-source directories whose contents are uploaded verbatim so the docs site can serve
 * author-supplied Agent Skills at `/.well-known/skills/…` (legacy v0.1.0 layout) and
 * `/.well-known/agent-skills/…` (current spec layout), making
 * `npx skills add https://<docs-domain>` work against Fern-hosted docs.
 */
export const WELL_KNOWN_SKILLS_DIRECTORIES: RelativeFilePath[] = [
    RelativeFilePath.of(".well-known/skills"),
    RelativeFilePath.of(".well-known/agent-skills")
];

export async function collectWellKnownSkillsFiles({
    absolutePathToFernFolder
}: {
    absolutePathToFernFolder: AbsoluteFilePath;
}): Promise<AbsoluteFilePath[]> {
    const filepaths: AbsoluteFilePath[] = [];
    for (const directory of WELL_KNOWN_SKILLS_DIRECTORIES) {
        const absoluteDirectory = join(absolutePathToFernFolder, directory);
        if (await doesPathExist(absoluteDirectory)) {
            const files = await getAllFilesInDirectory(absoluteDirectory);
            filepaths.push(...files.map(AbsoluteFilePath.of));
        }
    }
    return filepaths;
}
