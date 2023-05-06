import { FernToken } from "@fern-api/auth";
import { Audiences, combineAudiences } from "@fern-api/config-management-commons";
import { assertNever, entries } from "@fern-api/core-utils";
import { DocsNavigationItem, LogoReference } from "@fern-api/docs-configuration";
import { relative, RelativeFilePath } from "@fern-api/fs-utils";
import { registerApi } from "@fern-api/register";
import { createFdrService } from "@fern-api/services";
import { TaskContext } from "@fern-api/task-context";
import { DocsDefinition, FernWorkspace } from "@fern-api/workspace-loader";
import { FernRegistry } from "@fern-fern/registry";

export async function publishDocs({
    token,
    organization,
    docsDefinition,
    domain,
    workspace,
    context,
    audiences,
}: {
    token: FernToken;
    organization: string;
    docsDefinition: DocsDefinition;
    domain: string;
    workspace: FernWorkspace;
    context: TaskContext;
    audiences: Audiences;
}): Promise<void> {
    const fdr = createFdrService({ token: token.value });
    await fdr.docs.v1.registerDocs(
        await constructRegisterDocsRequest({
            docsDefinition,
            domain,
            organization,
            workspace,
            context,
            token,
            audiences,
        })
    );
}

async function constructRegisterDocsRequest({
    docsDefinition,
    domain,
    organization,
    workspace,
    context,
    token,
    audiences,
}: {
    docsDefinition: DocsDefinition;
    domain: string;
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    token: FernToken;
    audiences: Audiences;
}): Promise<FernRegistry.docs.v1.RegisterDocsRequest> {
    return {
        domain,
        orgId: FernRegistry.OrgId(organization),
        docsDefinition: {
            pages: entries(docsDefinition.pages).reduce(
                (pages, [pageFilepath, pageContents]) => ({
                    ...pages,
                    [constructPageId(pageFilepath)]: { markdown: pageContents },
                }),
                {}
            ),
            config: await convertDocsConfiguration({
                docsDefinition,
                organization,
                workspace,
                context,
                token,
                audiences,
            }),
        },
    };
}

async function convertDocsConfiguration({
    docsDefinition,
    organization,
    workspace,
    context,
    token,
    audiences,
}: {
    docsDefinition: DocsDefinition;
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    token: FernToken;
    audiences: Audiences;
}): Promise<FernRegistry.docs.v1.DocsConfig> {
    return {
        logo: docsDefinition.config.logo != null ? await convertLogoReference(docsDefinition.config.logo) : undefined,
        navigation: {
            items: await Promise.all(
                docsDefinition.config.navigation.items.map((item) =>
                    convertNavigationItem({ item, docsDefinition, organization, workspace, context, token, audiences })
                )
            ),
        },
        colors: {},
    };
}

async function convertLogoReference(logoReference: LogoReference): Promise<FernRegistry.docs.v1.Url> {
    switch (logoReference.type) {
        case "url":
            return FernRegistry.docs.v1.Url(logoReference.url);
        case "file": {
            // TODO upload to s3
            throw new Error("Logo must be a URL");
        }
        default:
            assertNever(logoReference);
    }
}

async function convertNavigationItem({
    item,
    docsDefinition,
    organization,
    workspace,
    context,
    token,
    audiences,
}: {
    item: DocsNavigationItem;
    docsDefinition: DocsDefinition;
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    token: FernToken;
    audiences: Audiences;
}): Promise<FernRegistry.docs.v1.NavigationItem> {
    switch (item.type) {
        case "page":
            return FernRegistry.docs.v1.NavigationItem.page(
                constructPageId(relative(docsDefinition.absoluteFilepath, item.absolutePath))
            );
        case "section":
            return FernRegistry.docs.v1.NavigationItem.section({
                title: item.title,
                items: await Promise.all(
                    item.items.map((nestedItem) =>
                        convertNavigationItem({
                            item: nestedItem,
                            docsDefinition,
                            organization,
                            workspace,
                            context,
                            token,
                            audiences,
                        })
                    )
                ),
            });
        case "apiSection": {
            const apiDefinitionId = await registerApi({
                organization,
                workspace,
                context,
                token,
                audiences: combineAudiences(audiences, item.audiences),
            });
            return FernRegistry.docs.v1.NavigationItem.api({
                title: item.title,
                api: apiDefinitionId,
            });
        }
        default:
            assertNever(item);
    }
}

function constructPageId(pathToPage: RelativeFilePath): FernRegistry.docs.v1.PageId {
    return FernRegistry.docs.v1.PageId(pathToPage);
}
