import { FernToken } from "@fern-api/auth";
import { Audiences, combineAudiences } from "@fern-api/config-management-commons";
import { assertNever, entries } from "@fern-api/core-utils";
import { DocsNavigationItem, LogoReference } from "@fern-api/docs-configuration";
import { relative, RelativeFilePath } from "@fern-api/fs-utils";
import { registerApi } from "@fern-api/register";
import { createFdrService } from "@fern-api/services";
import { TaskContext } from "@fern-api/task-context";
import { DocsDefinition, FernWorkspace } from "@fern-api/workspace-loader";
import { FernRegistry } from "@fern-fern/registry-node";
import chalk from "chalk";

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
    const registerDocsResponse = await fdr.docs.v1.write.registerDocs(
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
    if (registerDocsResponse.ok) {
        context.logger.info(chalk.green("Published docs to " + domain));
    } else {
        registerDocsResponse.error._visit({
            unauthorizedError: () => {
                return context.failAndThrow("Insufficient permissions. Failed to publish docs to " + domain);
            },
            userNotInOrgError: () => {
                return context.failAndThrow("Insufficient permissions. Failed to publish docs to " + domain);
            },
            _other: (value) => {
                if (value.reason === "non-json") {
                    context.logger.error("Request failed. Failed to publish docs to " + domain);
                    context.logger.debug(
                        `Received status code ${value.statusCode}. The body of the response was ${value.rawBody}`
                    );
                } else if (value.reason === "status-code") {
                    context.logger.error("Request failed. Failed to publish docs to " + domain);
                    context.logger.debug(
                        `Received status code ${value.statusCode}. The body of the response was ${JSON.stringify(
                            value.body
                        )}`
                    );
                } else if (value.reason === "timeout") {
                    context.logger.error("Request timed out. Failed to publish docs to " + domain);
                }
            },
        });
        return context.failAndThrow();
    }
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
}): Promise<FernRegistry.docs.v1.write.RegisterDocsRequest> {
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
}): Promise<FernRegistry.docs.v1.write.DocsConfig> {
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

async function convertLogoReference(logoReference: LogoReference): Promise<FernRegistry.docs.v1.write.Url> {
    switch (logoReference.type) {
        case "url":
            return FernRegistry.docs.v1.write.Url(logoReference.url);
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
}): Promise<FernRegistry.docs.v1.write.NavigationItem> {
    switch (item.type) {
        case "page":
            return FernRegistry.docs.v1.write.NavigationItem.page(
                constructPageId(relative(docsDefinition.absoluteFilepath, item.absolutePath))
            );
        case "section":
            return FernRegistry.docs.v1.write.NavigationItem.section({
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
            return FernRegistry.docs.v1.write.NavigationItem.api({
                title: item.title,
                api: apiDefinitionId,
            });
        }
        default:
            assertNever(item);
    }
}

function constructPageId(pathToPage: RelativeFilePath): FernRegistry.docs.v1.write.PageId {
    return FernRegistry.docs.v1.write.PageId(pathToPage);
}
