import { DocsV1Read, FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getPreviewDocsDefinition } from "../previewDocs";

vi.mock("fs/promises", () => ({
    readFile: vi.fn()
}));

vi.mock("@fern-api/docs-resolver", () => ({
    DocsDefinitionResolver: vi.fn(),
    filterOssWorkspaces: vi.fn().mockResolvedValue([])
}));

describe("getPreviewDocsDefinition - hot-reload image paths", () => {
    let mockContext: TaskContext;
    let mockProject: Project;

    beforeEach(() => {
        vi.clearAllMocks();

        mockContext = {
            logger: {
                debug: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn()
            }
        } as unknown as TaskContext;

        mockProject = {
            docsWorkspaces: {
                absoluteFilePath: AbsoluteFilePath.of("/test/fern"),
                config: {
                    instances: [{ url: "http://localhost:3000" }]
                }
            },
            apiWorkspaces: []
        } as unknown as Project;
    });

    test("should preserve /_local prefix for images during hot-reload", async () => {
        const imageAbsolutePath = AbsoluteFilePath.of("/test/fern/img/home/diagram.jpg");
        const existingFileId = "existing-file-id-123";

        const previousDocsDefinition: DocsV1Read.DocsDefinition = {
            pages: {
                [FdrAPI.PageId("pages/guide.md")]: {
                    markdown: "# Guide\n\n![Diagram](file:existing-file-id-123)",
                    editThisPageUrl: undefined,
                    rawMarkdown: "# Guide\n\n![Diagram](/img/home/diagram.jpg)"
                }
            },
            apis: {},
            apisV2: {},
            files: {},
            filesV2: {
                [existingFileId]: {
                    type: "url",
                    url: FernNavigation.Url(`/_local${imageAbsolutePath}`)
                }
            },
            config: {
                aiChatConfig: undefined,
                hideNavLinks: undefined,
                navigation: undefined,
                root: undefined,
                title: undefined,
                defaultLanguage: undefined,
                announcement: undefined,
                navbarLinks: undefined,
                footerLinks: undefined,
                logoHeight: undefined,
                logoHref: undefined,
                favicon: undefined,
                metadata: undefined,
                redirects: undefined,
                colorsV3: undefined,
                layout: undefined,
                settings: undefined,
                typographyV2: undefined,
                analyticsConfig: undefined,
                integrations: undefined,
                css: undefined,
                js: undefined,
                pageActions: undefined
            },
            jsFiles: undefined,
            id: undefined
        };

        const markdownFilePath = AbsoluteFilePath.of("/test/fern/pages/guide.md");
        const updatedMarkdown = "# Guide\n\n![Diagram](/img/home/diagram.jpg)\n\nUpdated content!";

        vi.mocked(readFile).mockResolvedValue(Buffer.from(updatedMarkdown));

        const result = await getPreviewDocsDefinition({
            domain: "localhost:3000",
            project: mockProject,
            context: mockContext,
            previousDocsDefinition,
            editedAbsoluteFilepaths: [markdownFilePath]
        });

        expect(result.pages[FdrAPI.PageId("pages/guide.md")]?.markdown).toContain(`file:${existingFileId}`);
        expect(result.pages[FdrAPI.PageId("pages/guide.md")]?.markdown).not.toContain("/img/home/diagram.jpg");
        expect(result.filesV2?.[existingFileId]).toBeDefined();
        expect(result.filesV2?.[existingFileId]?.url).toContain("/_local");
    });

    test("should add new images to filesV2 during hot-reload", async () => {
        const existingImagePath = AbsoluteFilePath.of("/test/fern/img/existing.png");
        const existingFileId = "existing-file-id";

        const previousDocsDefinition: DocsV1Read.DocsDefinition = {
            pages: {
                [FdrAPI.PageId("pages/guide.md")]: {
                    markdown: "# Guide\n\n![Existing](file:existing-file-id)",
                    editThisPageUrl: undefined,
                    rawMarkdown: "# Guide\n\n![Existing](/img/existing.png)"
                }
            },
            apis: {},
            apisV2: {},
            files: {},
            filesV2: {
                [existingFileId]: {
                    type: "url",
                    url: FernNavigation.Url(`/_local${existingImagePath}`)
                }
            },
            config: {
                aiChatConfig: undefined,
                hideNavLinks: undefined,
                navigation: undefined,
                root: undefined,
                title: undefined,
                defaultLanguage: undefined,
                announcement: undefined,
                navbarLinks: undefined,
                footerLinks: undefined,
                logoHeight: undefined,
                logoHref: undefined,
                favicon: undefined,
                metadata: undefined,
                redirects: undefined,
                colorsV3: undefined,
                layout: undefined,
                settings: undefined,
                typographyV2: undefined,
                analyticsConfig: undefined,
                integrations: undefined,
                css: undefined,
                js: undefined,
                pageActions: undefined
            },
            jsFiles: undefined,
            id: undefined
        };

        const markdownFilePath = AbsoluteFilePath.of("/test/fern/pages/guide.md");
        const updatedMarkdown = "# Guide\n\n![Existing](/img/existing.png)\n\n![New Image](/img/new-image.jpg)";

        vi.mocked(readFile).mockResolvedValue(Buffer.from(updatedMarkdown));

        const result = await getPreviewDocsDefinition({
            domain: "localhost:3000",
            project: mockProject,
            context: mockContext,
            previousDocsDefinition,
            editedAbsoluteFilepaths: [markdownFilePath]
        });

        const filesV2Keys = Object.keys(result.filesV2 ?? {});
        expect(filesV2Keys.length).toBeGreaterThan(1);

        const newImageFileId = filesV2Keys.find((id) => id !== existingFileId);
        expect(newImageFileId).toBeDefined();

        if (newImageFileId) {
            expect(result.filesV2?.[newImageFileId]?.url).toContain("/_local");
            expect(result.filesV2?.[newImageFileId]?.url).toContain("/img/new-image.jpg");
        }

        expect(result.pages[FdrAPI.PageId("pages/guide.md")]?.markdown).toContain(`file:${existingFileId}`);
        expect(result.pages[FdrAPI.PageId("pages/guide.md")]?.markdown).toContain("file:");
        expect(result.pages[FdrAPI.PageId("pages/guide.md")]?.markdown).not.toContain("/img/existing.png");
        expect(result.pages[FdrAPI.PageId("pages/guide.md")]?.markdown).not.toContain("/img/new-image.jpg");
    });

    test("should handle hot-reload when filesV2 is undefined", async () => {
        const previousDocsDefinition: DocsV1Read.DocsDefinition = {
            pages: {
                [FdrAPI.PageId("pages/guide.md")]: {
                    markdown: "# Guide",
                    editThisPageUrl: undefined,
                    rawMarkdown: "# Guide"
                }
            },
            apis: {},
            apisV2: {},
            files: {},
            filesV2: undefined,
            config: {
                aiChatConfig: undefined,
                hideNavLinks: undefined,
                navigation: undefined,
                root: undefined,
                title: undefined,
                defaultLanguage: undefined,
                announcement: undefined,
                navbarLinks: undefined,
                footerLinks: undefined,
                logoHeight: undefined,
                logoHref: undefined,
                favicon: undefined,
                metadata: undefined,
                redirects: undefined,
                colorsV3: undefined,
                layout: undefined,
                settings: undefined,
                typographyV2: undefined,
                analyticsConfig: undefined,
                integrations: undefined,
                css: undefined,
                js: undefined,
                pageActions: undefined
            },
            jsFiles: undefined,
            id: undefined
        };

        const markdownFilePath = AbsoluteFilePath.of("/test/fern/pages/guide.md");
        const updatedMarkdown = "# Guide\n\n![New Image](/img/diagram.jpg)";

        vi.mocked(readFile).mockResolvedValue(Buffer.from(updatedMarkdown));

        const result = await getPreviewDocsDefinition({
            domain: "localhost:3000",
            project: mockProject,
            context: mockContext,
            previousDocsDefinition,
            editedAbsoluteFilepaths: [markdownFilePath]
        });

        expect(result.filesV2).toBeDefined();
        const filesV2Keys = Object.keys(result.filesV2 ?? {});
        expect(filesV2Keys.length).toBeGreaterThan(0);

        const fileId = filesV2Keys[0];
        if (fileId) {
            expect(result.filesV2?.[fileId]?.url).toContain("/_local");
            expect(result.filesV2?.[fileId]?.url).toContain("/img/diagram.jpg");
        }

        expect(result.pages[FdrAPI.PageId("pages/guide.md")]?.markdown).toContain("file:");
        expect(result.pages[FdrAPI.PageId("pages/guide.md")]?.markdown).not.toContain("/img/diagram.jpg");
    });
});
