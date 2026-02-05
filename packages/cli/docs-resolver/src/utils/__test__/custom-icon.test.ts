import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";

import { DocsDefinitionResolver, FilePathPair, UploadedFile } from "../../DocsDefinitionResolver";

const context = createMockTaskContext();

describe("Custom icon functionality", () => {
    let docsWorkspace: NonNullable<Awaited<ReturnType<typeof loadDocsWorkspace>>>;

    beforeAll(async () => {
        const loadedWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/product-icons/fern"),
            context
        });

        if (loadedWorkspace == null) {
            throw new Error("Workspace is null");
        }

        docsWorkspace = loadedWorkspace;
    });

    describe("custom icon collection", () => {
        it("should collect custom icons for S3 upload", async () => {
            const uploadedFiles: FilePathPair[] = [];

            const resolver = new DocsDefinitionResolver({
                domain: "test.domain.com",
                docsWorkspace,
                ossWorkspaces: [],
                apiWorkspaces: [],
                taskContext: context,
                editThisPage: undefined,
                uploadFiles: async (files: FilePathPair[]): Promise<UploadedFile[]> => {
                    // Track uploaded files for testing
                    uploadedFiles.push(...files);
                    return files.map(
                        (file, index): UploadedFile => ({
                            ...file,
                            fileId: `test-file-id-${index}`
                        })
                    );
                },
                registerApi: async (_opts) => "",
                targetAudiences: undefined
            });

            const resolved = await resolver.resolve();

            // Verify the resolver completed successfully
            expect(resolved).toBeDefined();
            expect(resolved.config).toBeDefined();
            expect(resolved.pages).toBeDefined();

            // Check how many custom icons were collected for upload
            const svgFiles = uploadedFiles.filter((file) => file.relativeFilePath.endsWith(".svg"));
            expect(svgFiles.length).toBeGreaterThan(0);

            // Based on the fixture, we should have at least 3 custom SVG icons:
            // - fern.svg (navbar-links)
            // - virus.svg (core platform product)
            // - atom.svg (analytics and enterprise products - may be deduplicated)
            expect(svgFiles.length).toBeGreaterThanOrEqual(3);

            // Verify icon file names are present
            const iconFileNames = svgFiles.map((file) => file.relativeFilePath);
            expect(iconFileNames).toContain("fern.svg");
            expect(iconFileNames).toContain("virus.svg");
            expect(iconFileNames).toContain("atom.svg");
        });

        it("should handle mixed icon types (custom SVG and font awesome)", async () => {
            const uploadedFiles: FilePathPair[] = [];

            const resolver = new DocsDefinitionResolver({
                domain: "test.domain.com",
                docsWorkspace,
                ossWorkspaces: [],
                apiWorkspaces: [],
                taskContext: context,
                editThisPage: undefined,
                uploadFiles: async (files: FilePathPair[]): Promise<UploadedFile[]> => {
                    uploadedFiles.push(...files);
                    return files.map(
                        (file, index): UploadedFile => ({
                            ...file,
                            fileId: `test-file-id-${index}`
                        })
                    );
                },
                registerApi: async (_opts) => "",
                targetAudiences: undefined
            });

            const resolved = await resolver.resolve();

            // Should only upload SVG files, not font awesome icons
            const svgFiles = uploadedFiles.filter((file) => file.relativeFilePath.endsWith(".svg"));
            const nonSvgFiles = uploadedFiles.filter((file) => !file.relativeFilePath.endsWith(".svg"));

            expect(svgFiles.length).toBeGreaterThan(0);
            expect(nonSvgFiles.length).toBe(0); // Font awesome icons shouldn't be uploaded
        });

        it("should collect custom icons from MDX components (Card and Icon)", async () => {
            const uploadedFiles: FilePathPair[] = [];

            const resolver = new DocsDefinitionResolver({
                domain: "test.domain.com",
                docsWorkspace,
                ossWorkspaces: [],
                apiWorkspaces: [],
                taskContext: context,
                editThisPage: undefined,
                uploadFiles: async (files: FilePathPair[]): Promise<UploadedFile[]> => {
                    uploadedFiles.push(...files);
                    return files.map(
                        (file, index): UploadedFile => ({
                            ...file,
                            fileId: `test-file-id-${index}`
                        })
                    );
                },
                registerApi: async (_opts) => "",
                targetAudiences: undefined
            });

            const resolved = await resolver.resolve();

            // Verify the resolver completed successfully
            expect(resolved).toBeDefined();
            expect(resolved.config).toBeDefined();
            expect(resolved.pages).toBeDefined();

            const svgFiles = uploadedFiles.filter((file) => file.relativeFilePath.endsWith(".svg"));
            const iconFileNames = svgFiles.map((file) => file.relativeFilePath);

            // These should be collected for upload
            expect(iconFileNames).toContain("virus.svg");
            expect(iconFileNames).toContain("atom.svg");
            expect(iconFileNames).toContain("fern.svg");

            const fontAwesomeFiles = uploadedFiles.filter(
                (file) => file.relativeFilePath === "home" || file.relativeFilePath.includes("fa-solid")
            );
            expect(fontAwesomeFiles.length).toBe(0);
        });
    });
});

describe("Nested icon functionality", () => {
    let docsWorkspace: NonNullable<Awaited<ReturnType<typeof loadDocsWorkspace>>>;

    beforeAll(async () => {
        const loadedWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/page-in-products/fern"),
            context
        });

        if (loadedWorkspace == null) {
            throw new Error("Workspace is null");
        }

        docsWorkspace = loadedWorkspace;
    });

    describe("custom icon collection", () => {
        it("should collect custom icons for S3 upload", async () => {
            const uploadedFiles: FilePathPair[] = [];

            const resolver = new DocsDefinitionResolver({
                domain: "test.domain.com",
                docsWorkspace,
                ossWorkspaces: [],
                apiWorkspaces: [],
                taskContext: context,
                editThisPage: undefined,
                uploadFiles: async (files: FilePathPair[]): Promise<UploadedFile[]> => {
                    // Track uploaded files for testing
                    uploadedFiles.push(...files);
                    return files.map(
                        (file, index): UploadedFile => ({
                            ...file,
                            fileId: `test-file-id-${index}`
                        })
                    );
                },
                registerApi: async (_opts) => "",
                targetAudiences: undefined
            });

            const resolved = await resolver.resolve();

            // Verify the resolver completed successfully
            expect(resolved).toBeDefined();
            expect(resolved.config).toBeDefined();
            expect(resolved.pages).toBeDefined();

            // Check how many custom icons were collected for upload
            const svgFiles = uploadedFiles.filter((file) => file.relativeFilePath.endsWith(".svg"));
            expect(svgFiles.length).toBeGreaterThan(0);

            console.log("svgs:", svgFiles);

            // Based on the fixture, we should have at least 3 custom SVG icons:
            // - fern.svg (navbar-links)
            // - virus.svg (core platform product)
            // - atom.svg (analytics and enterprise products - may be deduplicated)
            expect(svgFiles.length).toBeGreaterThanOrEqual(5);

            // Verify icon file names are present
            const iconFileNames = svgFiles.map((file) => file.relativeFilePath);
            expect(iconFileNames).toContain("fern.svg");
            expect(iconFileNames).toContain("virus.svg");
            expect(iconFileNames).toContain("atom.svg");
            expect(iconFileNames).toContain("products/snow.svg");
            expect(iconFileNames).toContain("analytics/moon.svg");
        });

        it("should handle mixed icon types (custom SVG and font awesome)", async () => {
            const uploadedFiles: FilePathPair[] = [];

            const resolver = new DocsDefinitionResolver({
                domain: "test.domain.com",
                docsWorkspace,
                ossWorkspaces: [],
                apiWorkspaces: [],
                taskContext: context,
                editThisPage: undefined,
                uploadFiles: async (files: FilePathPair[]): Promise<UploadedFile[]> => {
                    uploadedFiles.push(...files);
                    return files.map(
                        (file, index): UploadedFile => ({
                            ...file,
                            fileId: `test-file-id-${index}`
                        })
                    );
                },
                registerApi: async (_opts) => "",
                targetAudiences: undefined
            });

            const resolved = await resolver.resolve();

            // Should only upload SVG files, not font awesome icons
            const svgFiles = uploadedFiles.filter((file) => file.relativeFilePath.endsWith(".svg"));
            const nonSvgFiles = uploadedFiles.filter((file) => !file.relativeFilePath.endsWith(".svg"));

            expect(svgFiles.length).toBeGreaterThan(0);
            expect(nonSvgFiles.length).toBe(0); // Font awesome icons shouldn't be uploaded
        });
    });
});
