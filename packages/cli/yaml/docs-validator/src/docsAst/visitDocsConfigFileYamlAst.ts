import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { docsYml } from "@fern-api/configuration-loader";
import { noop, visitObjectAsync } from "@fern-api/core-utils";
import { NodePath } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, dirname, doesPathExist, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { APIWorkspaceLoader } from "./APIWorkspaceLoader";
import { DocsConfigFileAstVisitor } from "./DocsConfigFileAstVisitor";
import { validateVersionConfigFileSchema } from "./validateVersionConfig";
import { visitFilepath } from "./visitFilepath";
import { visitNavigationAst } from "./visitNavigationAst";

export declare namespace visitDocsConfigFileYamlAst {
    interface Args {
        contents: docsYml.RawSchemas.DocsConfiguration;
        visitor: Partial<DocsConfigFileAstVisitor>;
        absoluteFilepathToConfiguration: AbsoluteFilePath;
        absolutePathToFernFolder: AbsoluteFilePath;
        context: TaskContext;
        loadAPIWorkspace: APIWorkspaceLoader;
    }
}

export async function visitDocsConfigFileYamlAst({
    contents,
    visitor,
    absoluteFilepathToConfiguration,
    context,
    loadAPIWorkspace,
    absolutePathToFernFolder
}: visitDocsConfigFileYamlAst.Args): Promise<void> {
    await visitor.file?.(
        {
            config: contents
        },
        []
    );
    await visitObjectAsync(contents, {
        instances: noop,
        analytics: noop,
        announcement: noop,
        backgroundImage: async (background) => {
            if (background == null) {
                return;
            } else if (typeof background === "string") {
                await visitFilepath({
                    absoluteFilepathToConfiguration,
                    rawUnresolvedFilepath: background,
                    visitor,
                    nodePath: ["background-image"]
                });
            } else {
                if (background.dark != null) {
                    await visitFilepath({
                        absoluteFilepathToConfiguration,
                        rawUnresolvedFilepath: background.dark,
                        visitor,
                        nodePath: ["background-image", "dark"]
                    });
                }
                if (background.light != null) {
                    await visitFilepath({
                        absoluteFilepathToConfiguration,
                        rawUnresolvedFilepath: background.light,
                        visitor,
                        nodePath: ["background-image", "light"]
                    });
                }
            }
        },
        colors: noop,
        css: async (css) => {
            if (css == null) {
                return;
            } else if (Array.isArray(css)) {
                // multiple CSS files
                await Promise.all(
                    css.map((stylesheet, idx) =>
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
                    rawUnresolvedFilepath: css,
                    visitor,
                    nodePath: ["css"],
                    willBeUploaded: false
                });
            }
        },
        defaultLanguage: noop,
        experimental: noop,
        favicon: async (favicon) => {
            if (favicon == null) {
                return;
            }

            await visitFilepath({
                absoluteFilepathToConfiguration,
                rawUnresolvedFilepath: favicon,
                visitor,
                nodePath: ["favicon"]
            });
        },
        footerLinks: noop,
        integrations: noop,
        js: async (js) => {
            if (js == null) {
                return;
            } else if (Array.isArray(js)) {
                // multiple JS configs
                await Promise.all(
                    js.map((script, idx) =>
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
                    script: js,
                    nodePath: ["js"]
                });
            }
        },
        landingPage: noop,
        layout: noop,
        logo: async (logo) => {
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
        },
        metadata: noop,
        navbarLinks: noop,
        navigation: async (navigation) => {
            if (navigation == null) {
                return;
            }

            await visitNavigationAst({
                absolutePathToFernFolder,
                navigation,
                visitor,
                nodePath: ["navigation"],
                absoluteFilepathToConfiguration,
                loadAPIWorkspace,
                context
            });
        },
        redirects: noop,
        tabs: noop,
        title: noop,
        typography: async (typography) => {
            if (typography == null) {
                return;
            }
            await visitObjectAsync(typography, {
                bodyFont: async (body) => {
                    if (body == null) {
                        return;
                    }
                    await visitFontConfig({
                        absoluteFilepathToConfiguration,
                        visitor,
                        font: body,
                        nodePath: ["typography", "bodyFont"]
                    });
                },
                codeFont: async (code) => {
                    if (code == null) {
                        return;
                    }
                    await visitFontConfig({
                        absoluteFilepathToConfiguration,
                        visitor,
                        font: code,
                        nodePath: ["typography", "codeFont"]
                    });
                },
                headingsFont: async (headings) => {
                    if (headings == null) {
                        return;
                    }
                    await visitFontConfig({
                        absoluteFilepathToConfiguration,
                        visitor,
                        font: headings,
                        nodePath: ["typography", "headingsFont"]
                    });
                }
            });
        },
        versions: async (versions) => {
            if (versions == null) {
                return;
            }

            await Promise.all(
                versions.map(async (version, idx) => {
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
                        await visitNavigationAst({
                            absolutePathToFernFolder,
                            navigation: parsedVersionFile.contents.navigation,
                            visitor,
                            nodePath: ["navigation"],
                            absoluteFilepathToConfiguration: absoluteFilepath,
                            loadAPIWorkspace,
                            context
                        });
                    }
                })
            );
        },
        roles: noop
    });
}

async function visitFontConfig({
    absoluteFilepathToConfiguration,
    visitor,
    font,
    nodePath
}: {
    absoluteFilepathToConfiguration: AbsoluteFilePath;
    visitor: Partial<DocsConfigFileAstVisitor>;
    font: docsYml.RawSchemas.FontConfig;
    nodePath: NodePath;
}): Promise<void> {
    if (font.path != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: font.path,
            visitor,
            nodePath,
            willBeUploaded: true
        });
    }

    for (const path of font.paths ?? []) {
        if (typeof path === "string") {
            await visitFilepath({
                absoluteFilepathToConfiguration,
                rawUnresolvedFilepath: path,
                visitor,
                nodePath,
                willBeUploaded: true
            });
        } else {
            await visitFilepath({
                absoluteFilepathToConfiguration,
                rawUnresolvedFilepath: path.path,
                visitor,
                nodePath,
                willBeUploaded: true
            });
        }
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
