import { assertNever } from "@fern-api/core-utils";
import { DocsConfiguration, DocsNavigationConfiguration, DocsNavigationItem } from "@fern-api/docs-configuration";
import { NodePath } from "../NodePath";
import { DocsConfigFileAstVisitor } from "./DocsConfigFileAstVisitor";

export async function visitDocsConfigFileYamlAst(
    contents: DocsConfiguration,
    visitor: Partial<DocsConfigFileAstVisitor>
): Promise<void> {
    if (contents.backgroundImage != null) {
        await visitor.filepath?.(contents.backgroundImage.filepath, ["background-image"]);
    }
    if (contents.favicon != null) {
        await visitor.filepath?.(contents.favicon.filepath, ["background-image"]);
    }
    if (contents.logo?.dark != null) {
        await visitor.filepath?.(contents.logo.dark.filepath, ["logo", "dark"]);
    }
    if (contents.logo?.light != null) {
        await visitor.filepath?.(contents.logo.light.filepath, ["logo", "light"]);
    }

    await visitNavigation({ navigation: contents.navigation, visitor, nodePath: ["navigation"] });

    if (contents.typography?.codeFont != null) {
        await visitor.filepath?.(contents.typography.codeFont.absolutePath, ["typography", "codeFont"]);
    }
    if (contents.typography?.bodyFont != null) {
        await visitor.filepath?.(contents.typography.bodyFont.absolutePath, ["typography", "bodyFont"]);
    }
    if (contents.typography?.headingsFont != null) {
        await visitor.filepath?.(contents.typography.headingsFont.absolutePath, ["typography", "headingsFont"]);
    }
}

async function visitNavigation({
    navigation,
    visitor,
    nodePath,
}: {
    navigation: DocsNavigationConfiguration;
    visitor: Partial<DocsConfigFileAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    switch (navigation.type) {
        case "untabbed":
            await Promise.all(
                navigation.items.map(async (item, idx) => {
                    await visitNavigationItem({ navigationItem: item, visitor, nodePath: [...nodePath, `${idx}`] });
                })
            );
            break;
        case "tabbed":
            break;
        case "versioned":
            break;
        default:
            assertNever(navigation);
    }
}

async function visitNavigationItem({
    navigationItem,
    visitor,
    nodePath,
}: {
    navigationItem: DocsNavigationItem;
    visitor: Partial<DocsConfigFileAstVisitor>;
    nodePath: NodePath;
}): Promise<void> {
    switch (navigationItem.type) {
        case "page":
            await visitor.filepath?.(navigationItem.absolutePath, [...nodePath, "page"]);
            break;
        case "section":
            await Promise.all(
                navigationItem.contents.map(async (navigationItem, idx) => {
                    await visitNavigationItem({
                        navigationItem,
                        visitor,
                        nodePath: [...nodePath, "contents", `${idx}`],
                    });
                })
            );
            break;
        case "apiSection":
            break;
        default:
            assertNever(navigationItem);
    }
}
