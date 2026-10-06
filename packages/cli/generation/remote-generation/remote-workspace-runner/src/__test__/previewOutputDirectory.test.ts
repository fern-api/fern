import { getSdkGenApiPreviewOutputDirectoryName } from "../previewOutputDirectory.js";

describe("getSdkGenApiPreviewOutputDirectoryName", () => {
    it("uses preserved SDK Config target indexes for duplicate-language preview directories", () => {
        const first = getSdkGenApiPreviewOutputDirectoryName("fernapi/fern-typescript-sdk", 0);
        const second = getSdkGenApiPreviewOutputDirectoryName("fernapi/fern-typescript-sdk", 1);

        expect(first).toBe("fern-typescript-sdk-0");
        expect(second).toBe("fern-typescript-sdk-1");
        expect(first).not.toBe(second);
    });

    it("preserves the existing generators.yml preview directory", () => {
        expect(getSdkGenApiPreviewOutputDirectoryName("fernapi/fern-typescript-sdk")).toBe("fern-typescript-sdk");
    });
});
