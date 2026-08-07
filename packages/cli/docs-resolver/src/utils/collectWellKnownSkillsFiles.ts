import { AbsoluteFilePath, doesPathExist, getAllFilesInDirectory, join, RelativeFilePath } from "@fern-api/fs-utils";

/**
 * Docs-source directories whose contents are uploaded verbatim so the docs site can serve
 * author-supplied Agent Skills at `/.well-known/skills/…` (legacy v0.1.0 layout) and
 * `/.well-known/agent-skills/…` (current spec layout), making
 * `npx skills add https://<docs-domain>` work against Fern-hosted docs.
 *
 * This raw passthrough is the quiet fallback for sites that hand-build their bundles. When
 * docs.yml declares `page-actions.options.skills.path`, the CLI generates the
 * `.well-known/skills/…` bundle from that path instead and a hand-populated
 * `.well-known/skills/` folder is ignored (see {@link DECLARED_SKILLS_UPLOAD_DIRECTORY}).
 */
export const WELL_KNOWN_SKILLS_DIRECTORY = RelativeFilePath.of(".well-known/skills");
export const WELL_KNOWN_AGENT_SKILLS_DIRECTORY = RelativeFilePath.of(".well-known/agent-skills");

export const WELL_KNOWN_SKILLS_DIRECTORIES: RelativeFilePath[] = [
    WELL_KNOWN_SKILLS_DIRECTORY,
    WELL_KNOWN_AGENT_SKILLS_DIRECTORY
];

export async function collectWellKnownSkillsFiles({
    absolutePathToFernFolder,
    directories = WELL_KNOWN_SKILLS_DIRECTORIES
}: {
    absolutePathToFernFolder: AbsoluteFilePath;
    directories?: RelativeFilePath[];
}): Promise<AbsoluteFilePath[]> {
    const filepaths: AbsoluteFilePath[] = [];
    for (const directory of directories) {
        const absoluteDirectory = join(absolutePathToFernFolder, directory);
        if (await doesPathExist(absoluteDirectory)) {
            const files = await getAllFilesInDirectory(absoluteDirectory);
            filepaths.push(...files.map(AbsoluteFilePath.of));
        }
    }
    return filepaths;
}
