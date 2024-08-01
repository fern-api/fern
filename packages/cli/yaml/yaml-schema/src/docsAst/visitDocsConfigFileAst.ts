import { docsYml } from "@fern-api/configuration";
import { parseImagePaths, replaceReferencedCode, replaceReferencedMarkdown } from "@fern-api/docs-markdown-utils";
import { AbsoluteFilePath, dirname, doesPathExist, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { NodePath } from "../NodePath";
import { DocsConfigFileAstVisitor } from "./DocsConfigFileAstVisitor";
import { validateVersionConfigFileSchema } from "./validateVersionConfig";

export async function visitDocsConfigFileYamlAst(
    contents: docsYml.RawSchemas.DocsConfiguration,
    visitor: Partial<DocsConfigFileAstVisitor>,
    absoluteFilepathToConfiguration: AbsoluteFilePath,
    absolutePathToFernFolder: AbsoluteFilePath,
    context: TaskContext
): Promise<void> {
    await visitor.file?.(
        {
            config: contents
        },
        []
    );

    // the following code parses markdown files for media and adds them to the filepath visitor
    let pageEntries: Record<RelativeFilePath, string> = {};

    try {
        // wrap the parse call in a try/catch because it will throw if a markdown file doesn't exist
        const { pages } = await docsYml.parseDocsConfiguration({
            rawDocsConfiguration: contents,
            context,
            absoluteFilepathToDocsConfig: absoluteFilepathToConfiguration,
            absolutePathToFernFolder
        });
        pageEntries = pages;
    } catch {
        // if the parse fails, we'll just skip this step
    }

    // replaces all instances of <Markdown src="path/to/file.md" /> with the content of the referenced markdown file
    // this should happen before we parse image paths, as the referenced markdown files may contain images.
    for (const [relativePath, markdown] of Object.entries(pageEntries)) {
        pageEntries[RelativeFilePath.of(relativePath)] = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMdx: resolve(absolutePathToFernFolder, relativePath),
            context
        });
        pageEntries[RelativeFilePath.of(relativePath)] = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMdx: resolve(absolutePathToFernFolder, relativePath),
            context
        });
    }

    for (const [relativePath, markdown] of Object.entries(pageEntries)) {
        const { filepaths } = parseImagePaths(markdown, {
            absolutePathToFernFolder,
            absolutePathToMdx: resolve(absolutePathToFernFolder, relativePath)
        });

        // visit each media filepath in each markdown file
        for (const filepath of filepaths) {
            await visitor.filepath?.(
                {
                    absoluteFilepath: filepath,
                    value: path.relative(absolutePathToFernFolder, filepath),
                    willBeUploaded: true
                },
                [relativePath]
            );
        }
    }

    if (contents.js != null) {
        if (Array.isArray(contents.js)) {
            // multiple JS configs
            await Promise.all(
                contents.js.map((script, idx) =>
                    visitScript({
                        absoluteFilepathToConfiguration,
                        visitor,
                        script,
                        nodePath: ["js", `${idx}`]
                    })
                )
            );
        } else {
            // single JS config
            await visitScript({
                absoluteFilepathToConfiguration,
                visitor,
                script: contents.js,
                nodePath: ["js"]
            });
        }
    }

    if (contents.css != null) {
        if (Array.isArray(contents.css)) {
            // multiple CSS files
            await Promise.all(
                contents.css.map((stylesheet, idx) =>
                    visitFilepath({
                        absoluteFilepathToConfiguration,
                        rawUnresolvedFilepath: stylesheet,
                        visitor,
                        nodePath: ["css", `${idx}`],
                        willBeUploaded: false
                    })
                )
            );
        } else {
            await visitFilepath({
                absoluteFilepathToConfiguration,
                rawUnresolvedFilepath: contents.css,
                visitor,
                nodePath: ["css"],
                willBeUploaded: false
            });
        }
    }

    if (contents.backgroundImage != null) {
        if (typeof contents.backgroundImage === "string") {
            await visitFilepath({
                absoluteFilepathToConfiguration,
                rawUnresolvedFilepath: contents.backgroundImage,
                visitor,
                nodePath: ["background-image"]
            });
        } else {
            if (contents.backgroundImage.dark != null) {
                await visitFilepath({
                    absoluteFilepathToConfiguration,
                    rawUnresolvedFilepath: contents.backgroundImage.dark,
                    visitor,
                    nodePath: ["background-image", "dark"]
                });
            }
            if (contents.backgroundImage.light != null) {
                await visitFilepath({
                    absoluteFilepathToConfiguration,
                    rawUnresolvedFilepath: contents.backgroundImage.light,
                    visitor,
                    nodePath: ["background-image", "light"]
                });
            }
        }
    }
    if (contents.favicon != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.favicon,
            visitor,
            nodePath: ["favicon"]
        });
    }
    if (contents.logo?.dark != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.logo.dark,
            visitor,
            nodePath: ["logo", "dark"]
        });
    }
    if (contents.logo?.light != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.logo.light,
            visitor,
            nodePath: ["logo", "light"]
        });
    }

    if (contents.navigation != null) {
        await visitNavigation({
            navigation: contents.navigation,
            visitor,
            nodePath: ["navigation"],
            absoluteFilepathToConfiguration
        });
    }

    if (contents.typography?.codeFont?.path != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.typography.codeFont.path,
            visitor,
            nodePath: ["typography", "codeFont"]
        });
    }

    for (const path of contents.typography?.codeFont?.paths ?? []) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: typeof path === "string" ? path : path.path,
            visitor,
            nodePath: ["typography", "codeFont"]
        });
    }

    if (contents.typography?.bodyFont?.path != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.typography.bodyFont.path,
            visitor,
            nodePath: ["typography", "bodyFont"]
        });
    }

    for (const path of contents.typography?.bodyFont?.paths ?? []) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: typeof path === "string" ? path : path.path,
            visitor,
            nodePath: ["typography", "bodyFont"]
        });
    }

    if (contents.typography?.headingsFont?.path != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.typography.headingsFont.path,
            visitor,
            nodePath: ["typography", "headingsFont"]
        });
    }

    for (const path of contents.typography?.headingsFont?.paths ?? []) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: typeof path === "string" ? path : path.path,
            visitor,
            nodePath: ["typography", "headingsFont"]
        });
    }

    if (contents.versions != null) {
        await Promise.all(
            contents.versions.map(async (version, idx) => {
                await visitFilepath({
                    absoluteFilepathToConfiguration,
                    rawUnresolvedFilepath: version.path,
                    visitor,
                    nodePath: ["versions", `${idx}`],
                    willBeUploaded: false
                });
                const absoluteFilepath = resolve(dirname(absoluteFilepathToConfiguration), version.path);
                const content = yaml.load((await readFile(absoluteFilepath)).toString());
                if (await doesPathExist(absoluteFilepath)) {
                    await visitor.versionFile?.(
                        {
                            path: version.path,
                            content
                        },
                        [version.path]
                    );
                }
                const parsedVersionFile = await validateVersionConfigFileSchema({ value: content });
                if (parsedVersionFile.type === "success") {
                    await visitNavigation({
                        navigation: parsedVersionFile.contents.navigation,
                        visitor,
                        nodePath: ["navigation"],
                        absoluteFilepathToConfiguration: absoluteFilepath
                    });
                }
            })
        );
    }
}

async function visitFilepath({
    absoluteFilepathToConfiguration,
    rawUnresolvedFilepath,
    visitor,
    nodePath,
    willBeUploaded = true
}: {
    absoluteFilepathToConfiguration: AbsoluteFilePath;
    rawUnresolvedFilepath: string;
    visitor: Partial<DocsConfigFileAstVisitor>;
    nodePath: NodePath;
    willBeUploaded?: boolean;
}) {
    const absoluteFilepath = resolve(dirname(absoluteFilepathToConfiguration), rawUnresolvedFilepath);
    await visitor.filepath?.(
        {
            absoluteFilepath,
            value: rawUnresolvedFilepath,
            willBeUploaded
        },
        nodePath
    );
}

async function visitNavigation({
    navigation,
    visitor,
    nodePath,
    absoluteFilepathToConfiguration
}: {
    navigation: docsYml.RawSchemas.NavigationConfig;
    visitor: Partial<DocsConfigFileAstVisitor>;
    nodePath: NodePath;
    absoluteFilepathToConfiguration: AbsoluteFilePath;
}): Promise<void> {
    if (navigationConfigIsTabbed(navigation)) {
        await Promise.all(
            navigation.map(async (tab, tabIdx) => {
                if (tab.layout != null) {
                    await Promise.all(
                        tab.layout.map(async (item, itemIdx) => {
                            await visitNavigationItem({
                                navigationItem: item,
                                visitor,
                                nodePath: [...nodePath, `${tabIdx}`, "layout", `${itemIdx}`],
                                absoluteFilepathToConfiguration
                            });
                        })
                    );
                }
            })
        );
    } else {
        await Promise.all(
            navigation.map(async (item, itemIdx) => {
                await visitNavigationItem({
                    navigationItem: item,
                    visitor,
                    nodePath: [...nodePath, `${itemIdx}`],
                    absoluteFilepathToConfiguration
                });
            })
        );
    }
}

async function visitNavigationItem({
    navigationItem,
    visitor,
    nodePath,
    absoluteFilepathToConfiguration
}: {
    navigationItem: docsYml.RawSchemas.NavigationItem;
    visitor: Partial<DocsConfigFileAstVisitor>;
    nodePath: NodePath;
    absoluteFilepathToConfiguration: AbsoluteFilePath;
}): Promise<void> {
    if (navigationItemIsPage(navigationItem)) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: navigationItem.path,
            visitor,
            nodePath: [...nodePath, "page"],
            willBeUploaded: false
        });
        const absoluteFilepath = resolve(dirname(absoluteFilepathToConfiguration), navigationItem.path);
        if (await doesPathExist(absoluteFilepath)) {
            const content = (await readFile(absoluteFilepath)).toString();
            await visitor.markdownPage?.(
                {
                    title: navigationItem.page,
                    content,
                    absoluteFilepath
                },
                [...nodePath, "page", navigationItem.path]
            );
        }
    }

    if (navigationItemIsSection(navigationItem)) {
        await Promise.all(
            navigationItem.contents.map(async (item, itemIdx) => {
                await visitNavigationItem({
                    navigationItem: item,
                    visitor,
                    nodePath: [...nodePath, "section", "contents", `${itemIdx}`],
                    absoluteFilepathToConfiguration
                });
            })
        );
    }
}

async function visitScript({
    absoluteFilepathToConfiguration,
    visitor,
    script,
    nodePath
}: {
    absoluteFilepathToConfiguration: AbsoluteFilePath;
    visitor: Partial<DocsConfigFileAstVisitor>;
    script: docsYml.RawSchemas.JsConfigOptions;
    nodePath: NodePath;
}) {
    const rawUnresolvedFilepath = typeof script === "string" ? script : "path" in script ? script.path : null;

    if (rawUnresolvedFilepath) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath,
            visitor,
            nodePath,
            willBeUploaded: true
        });
    }
}

function navigationItemIsPage(item: docsYml.RawSchemas.NavigationItem): item is docsYml.RawSchemas.PageConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as docsYml.RawSchemas.PageConfiguration).page != null;
}

function navigationItemIsSection(
    item: docsYml.RawSchemas.NavigationItem
): item is docsYml.RawSchemas.SectionConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as docsYml.RawSchemas.SectionConfiguration).section != null;
}

function navigationConfigIsTabbed(
    config: docsYml.RawSchemas.NavigationConfig
): config is docsYml.RawSchemas.TabbedNavigationConfig {
    return (config as docsYml.RawSchemas.TabbedNavigationConfig)[0]?.tab != null;
}
