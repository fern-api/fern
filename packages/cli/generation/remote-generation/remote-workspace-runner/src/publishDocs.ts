import { FernToken } from "@fern-api/auth";
import { combineAudiences } from "@fern-api/config-management-commons";
import { assertNever, entries } from "@fern-api/core-utils";
import { DocsNavigationItem, ImageReference, TypographyConfig } from "@fern-api/docs-configuration";
import { AbsoluteFilePath, relative, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorGroup } from "@fern-api/generators-configuration";
import { registerApi } from "@fern-api/register";
import { createFdrService } from "@fern-api/services";
import { TaskContext } from "@fern-api/task-context";
import { DocsDefinition, FernWorkspace } from "@fern-api/workspace-loader";
import { FernRegistry } from "@fern-fern/registry-node";
import axios from "axios";
import chalk from "chalk";
import { readFile } from "fs/promises";

export async function publishDocs({
    token,
    organization,
    docsDefinition,
    domain,
    customDomains,
    workspace,
    context,
    generatorGroup,
    version,
}: {
    token: FernToken;
    organization: string;
    docsDefinition: DocsDefinition;
    domain: string;
    customDomains: string[];
    workspace: FernWorkspace;
    context: TaskContext;
    generatorGroup: GeneratorGroup;
    version: string | undefined;
}): Promise<void> {
    const fdr = createFdrService({ token: token.value });

    const filepathsToUpload = getFilepathsToUpload(docsDefinition);

    const startDocsRegisterResponse = await fdr.docs.v2.write.startDocsRegister({
        domain,
        customDomains,
        apiId: FernRegistry.ApiId(workspace.definition.rootApiFile.contents.name),
        orgId: FernRegistry.OrgId(organization),
        filepaths: filepathsToUpload.map((filepath) => convertAbsoluteFilepathToFdrFilepath(filepath, docsDefinition)),
    });

    if (!startDocsRegisterResponse.ok) {
        return startDocsRegisterResponse.error._visit<never>({
            _other: (error) => {
                return context.failAndThrow("Failed to publish docs.", error);
            },
            invalidDomainError: () => {
                return context.failAndThrow(
                    `Your docs domain should end with ${process.env.DOCS_DOMAIN_SUFFIX ?? "docs.buildwithfern.com"}`
                );
            },
            invalidCustomDomainError: () => {
                return context.failAndThrow(
                    "Please make sure that none of your custom domains are not overlapping (i.e. one is a substring of another)"
                );
            },
        });
    }

    const { docsRegistrationId, uploadUrls } = startDocsRegisterResponse.body;

    await Promise.all(
        filepathsToUpload.map(async (filepathToUpload) => {
            const uploadUrl = uploadUrls[convertAbsoluteFilepathToFdrFilepath(filepathToUpload, docsDefinition)];
            if (uploadUrl == null) {
                context.failAndThrow(`Failed to upload ${filepathToUpload}`, "Upload URL is missing");
            } else {
                await axios.put(uploadUrl.uploadUrl, await readFile(filepathToUpload), {
                    headers: {
                        "Content-Type": "application/octet-stream",
                    },
                });
            }
        })
    );

    const registerDocsRequest = await constructRegisterDocsRequest({
        docsDefinition,
        organization,
        workspace,
        context,
        token,
        generatorGroup,
        uploadUrls,
        version,
    });
    context.logger.debug(JSON.stringify(registerDocsRequest));
    const registerDocsResponse = await fdr.docs.v2.write.finishDocsRegister(docsRegistrationId, registerDocsRequest);
    if (registerDocsResponse.ok) {
        const url = domain.startsWith("https://") ? domain : `https://${domain}`;
        context.logger.info(chalk.green(`Published docs to ${url}`));
    } else {
        registerDocsResponse.error._visit<never>({
            unauthorizedError: () => {
                return context.failAndThrow("Insufficient permissions. Failed to publish docs to " + domain);
            },
            userNotInOrgError: () => {
                return context.failAndThrow("Insufficient permissions. Failed to publish docs to " + domain);
            },
            docsRegistrationIdNotFound: () => {
                return context.failAndThrow(
                    "Failed to publish docs to " + domain,
                    `Docs registration ID ${docsRegistrationId} does not exist.`
                );
            },
            _other: (error) => {
                return context.failAndThrow("Failed to publish docs to " + domain, error);
            },
        });
        return context.failAndThrow();
    }
}

async function constructRegisterDocsRequest({
    docsDefinition,
    organization,
    workspace,
    context,
    token,
    generatorGroup,
    uploadUrls,
    version,
}: {
    docsDefinition: DocsDefinition;
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    token: FernToken;
    generatorGroup: GeneratorGroup;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    version: string | undefined;
}): Promise<FernRegistry.docs.v2.write.RegisterDocsRequest> {
    return {
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
                generatorGroup,
                uploadUrls,
                version,
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
    generatorGroup,
    uploadUrls,
    version,
}: {
    docsDefinition: DocsDefinition;
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    token: FernToken;
    generatorGroup: GeneratorGroup;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    version: string | undefined;
}): Promise<FernRegistry.docs.v1.write.DocsConfig> {
    return {
        title: docsDefinition.config.title,
        logo:
            docsDefinition.config.logo != null
                ? await convertImageReference({
                      imageReference: docsDefinition.config.logo.reference,
                      docsDefinition,
                      uploadUrls,
                      context,
                  })
                : undefined,
        logoHref: docsDefinition.config.logo?.href,
        favicon:
            docsDefinition.config.favicon != null
                ? await convertImageReference({
                      imageReference: docsDefinition.config.favicon,
                      docsDefinition,
                      uploadUrls,
                      context,
                  })
                : undefined,
        navigation: {
            items: await Promise.all(
                docsDefinition.config.navigation.items.map((item) =>
                    convertNavigationItem({
                        item,
                        docsDefinition,
                        organization,
                        workspace,
                        context,
                        token,
                        generatorGroup,
                        version,
                    })
                )
            ),
        },
        colors: docsDefinition.config.colors,
        navbarLinks: docsDefinition.config.navbarLinks,
        typography: convertDocsTypographyConfiguration({
            typographyConfiguration: docsDefinition.config.typography,
            docsDefinition,
            uploadUrls,
            context,
        }),
    };
}

function convertDocsTypographyConfiguration({
    typographyConfiguration,
    docsDefinition,
    uploadUrls,
    context,
}: {
    typographyConfiguration?: TypographyConfig;
    docsDefinition: DocsDefinition;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    context: TaskContext;
}): FernRegistry.docs.v1.write.DocsTypographyConfig | undefined {
    if (typographyConfiguration == null) {
        return;
    }
    const result: FernRegistry.docs.v1.write.DocsTypographyConfig = {};

    if (typographyConfiguration.headingsFont != null) {
        const filepath = convertAbsoluteFilepathToFdrFilepath(
            typographyConfiguration.headingsFont.absolutePath,
            docsDefinition
        );
        const file = uploadUrls[filepath];
        if (file == null) {
            return context.failAndThrow("Failed to locate headingsFont file after uploading");
        }
        result.headingsFont = {
            name: typographyConfiguration.headingsFont.name,
            fontFile: file.fileId,
        };
    }

    if (typographyConfiguration.bodyFont != null) {
        const filepath = convertAbsoluteFilepathToFdrFilepath(
            typographyConfiguration.bodyFont.absolutePath,
            docsDefinition
        );
        const file = uploadUrls[filepath];
        if (file == null) {
            return context.failAndThrow("Failed to locate bodyFont file after uploading");
        }
        result.headingsFont = {
            name: typographyConfiguration.bodyFont.name,
            fontFile: file.fileId,
        };
    }

    if (typographyConfiguration.codeFont != null) {
        const filepath = convertAbsoluteFilepathToFdrFilepath(
            typographyConfiguration.codeFont.absolutePath,
            docsDefinition
        );
        const file = uploadUrls[filepath];
        if (file == null) {
            return context.failAndThrow("Failed to locate codeFont file after uploading");
        }
        result.headingsFont = {
            name: typographyConfiguration.codeFont.name,
            fontFile: file.fileId,
        };
    }

    return result;
}

async function convertImageReference({
    imageReference,
    docsDefinition,
    uploadUrls,
    context,
}: {
    imageReference: ImageReference;
    docsDefinition: DocsDefinition;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    context: TaskContext;
}): Promise<FernRegistry.docs.v1.write.FileId> {
    const filepath = convertAbsoluteFilepathToFdrFilepath(imageReference.filepath, docsDefinition);
    const file = uploadUrls[filepath];
    if (file == null) {
        return context.failAndThrow("Failed to locate file after uploading");
    }
    return file.fileId;
}

async function convertNavigationItem({
    item,
    docsDefinition,
    organization,
    workspace,
    context,
    token,
    generatorGroup,
    version,
}: {
    item: DocsNavigationItem;
    docsDefinition: DocsDefinition;
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    token: FernToken;
    generatorGroup: GeneratorGroup;
    version: string | undefined;
}): Promise<FernRegistry.docs.v1.write.NavigationItem> {
    switch (item.type) {
        case "page":
            return FernRegistry.docs.v1.write.NavigationItem.page({
                title: item.title,
                id: constructPageId(relative(docsDefinition.absoluteFilepath, item.absolutePath)),
            });
        case "section":
            return FernRegistry.docs.v1.write.NavigationItem.section({
                title: item.title,
                items: await Promise.all(
                    item.contents.map((nestedItem) =>
                        convertNavigationItem({
                            item: nestedItem,
                            docsDefinition,
                            organization,
                            workspace,
                            context,
                            token,
                            generatorGroup,
                            version,
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
                audiences: combineAudiences(generatorGroup.audiences, item.audiences),
            });
            return FernRegistry.docs.v1.write.NavigationItem.api({
                title: item.title,
                api: apiDefinitionId,
                artifacts: constructArtifacts({ generatorGroup, version }),
            });
        }
        default:
            assertNever(item);
    }
}

function constructPageId(pathToPage: RelativeFilePath): FernRegistry.docs.v1.write.PageId {
    return FernRegistry.docs.v1.write.PageId(pathToPage);
}

function getFilepathsToUpload(docsDefinition: DocsDefinition): AbsoluteFilePath[] {
    const filepaths: AbsoluteFilePath[] = [];

    if (docsDefinition.config.logo != null) {
        filepaths.push(docsDefinition.config.logo.reference.filepath);
    }

    if (docsDefinition.config.favicon != null) {
        filepaths.push(docsDefinition.config.favicon.filepath);
    }

    const typographyConfiguration = docsDefinition.config.typography;

    if (typographyConfiguration?.headingsFont != null) {
        filepaths.push(typographyConfiguration.headingsFont.absolutePath);
    }
    if (typographyConfiguration?.bodyFont != null) {
        filepaths.push(typographyConfiguration.bodyFont.absolutePath);
    }
    if (typographyConfiguration?.codeFont != null) {
        filepaths.push(typographyConfiguration.codeFont.absolutePath);
    }

    return filepaths;
}

function convertAbsoluteFilepathToFdrFilepath(filepath: AbsoluteFilePath, docsDefinition: DocsDefinition) {
    return FernRegistry.docs.v1.write.FilePath(relative(docsDefinition.absoluteFilepath, filepath));
}

function constructArtifacts({
    generatorGroup,
    version,
}: {
    generatorGroup: GeneratorGroup;
    version: string | undefined;
}): FernRegistry.docs.v1.write.ApiArtifacts | undefined {
    if (version == null) {
        return undefined;
    }
    const sdks: FernRegistry.docs.v1.write.PublishedSdk[] = [];
    for (const generator of generatorGroup.generators) {
        if (generator.outputMode.type !== "github" || generator.outputMode.publishInfo == null) {
            continue;
        }

        const githubRepoName = `${generator.outputMode.owner}/${generator.outputMode.repo}`;
        const sdk = generator.outputMode.publishInfo._visit<FernRegistry.docs.v1.write.PublishedSdk | undefined>({
            npm: (npm) =>
                FernRegistry.docs.v1.write.PublishedSdk.npm({
                    packageName: npm.packageName,
                    githubRepoName,
                    version,
                }),
            maven: (maven) =>
                FernRegistry.docs.v1.write.PublishedSdk.maven({
                    coordinate: maven.coordinate,
                    githubRepoName,
                    version,
                }),
            pypi: (pypi) =>
                FernRegistry.docs.v1.write.PublishedSdk.pypi({
                    packageName: pypi.packageName,
                    githubRepoName,
                    version,
                }),
            postman: () => undefined,
            _other: () => undefined,
        });
        if (sdk != null) {
            sdks.push(sdk);
        }
    }

    return { sdks };
}
