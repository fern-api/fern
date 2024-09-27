import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { DocsConfigFileAstVisitor } from "./DocsConfigFileAstVisitor";
import { validateVersionConfigFileSchema } from "./validateVersionConfig";
import { APIWorkspaceLoader } from "./APIWorkspaceLoader";
import { noop, visitDiscriminatedUnion, visitObject } from "@fern-api/core-utils";
import { NodePath } from "@fern-api/fern-definition-schema";

export declare namespace visitDocsConfigFile {
    interface Args {
        contents: docsYml.RawSchemas.DocsConfiguration;
        visitor: Partial<DocsConfigFileAstVisitor>;
        absoluteFilepathToConfiguration: AbsoluteFilePath;
        absolutePathToFernFolder: AbsoluteFilePath;
        context: TaskContext;
        loadAPIWorkspace: APIWorkspaceLoader;
    }
}

export async function visitDocsConfigFile({
    contents,
    visitor,
    absoluteFilepathToConfiguration,
    context,
    loadAPIWorkspace,
    absolutePathToFernFolder
}: visitDocsConfigFile.Args): Promise<void> {
    await visitor.file?.(
        {
            config: contents
        },
        []
    );
    await visitObject(contents, {
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
                    script: jss,
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

            await visitNavigation({
                navigation: contents.navigation,
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
        typography: (typography) => {
            if (typography == null) {
                return;
            }
            visitObject(typography, {
                bodyFont: async (body) => {
                    if (body == null) {
                        return;
                    }
                    await visitFilepath({
                        visitor,
                        nodePath: ["navigation"],
                        absoluteFilepathToConfiguration,
                        context
                    });
                },
                codeFont: () => {},
                headingsFont: () => {}
            });
        },
        versions: noop
    });
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
