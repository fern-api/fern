import { describe, expect, it } from "vitest";

function npmInstall({
    originalPackageName,
    previewPackageName,
    previewVersion,
    registryUrl
}: {
    originalPackageName: string;
    previewPackageName: string;
    previewVersion: string;
    registryUrl: string;
}): string {
    return (
        `npm install ${originalPackageName}@npm:${previewPackageName}@${previewVersion} ` + `--registry ${registryUrl}`
    );
}

function pipInstall({
    previewPackageName,
    previewVersion,
    registryUrl
}: {
    previewPackageName: string;
    previewVersion: string;
    registryUrl: string;
}): string {
    return `pip install ${previewPackageName}==${previewVersion} --index-url ${registryUrl}`;
}

describe("install command formatting", () => {
    it("npm canonical", () => {
        expect(
            npmInstall({
                originalPackageName: "@acme/sdk",
                previewPackageName: "@acme-preview/sdk",
                previewVersion: "0.0.1-feat-add-auth.1710434700",
                registryUrl: "https://npm.buildwithfern.com"
            })
        ).toBe(
            "npm install @acme/sdk@npm:@acme-preview/sdk@0.0.1-feat-add-auth.1710434700 " +
                "--registry https://npm.buildwithfern.com"
        );
    });

    it("pypi canonical", () => {
        expect(
            pipInstall({
                previewPackageName: "acme-preview-acme-sdk",
                previewVersion: "0.0.1.dev1710434700+feat.add.auth",
                registryUrl: "https://pypi.example.com/legacy/"
            })
        ).toBe(
            "pip install acme-preview-acme-sdk==0.0.1.dev1710434700+feat.add.auth " +
                "--index-url https://pypi.example.com/legacy/"
        );
    });

    it("pypi with PEP 503-normalized name", () => {
        expect(
            pipInstall({
                previewPackageName: "acme-preview-acme-sdk",
                previewVersion: "0.0.1.dev1710434700+feat.add.auth",
                registryUrl: "https://pypi.example.com/legacy/"
            })
        ).toContain("acme-preview-acme-sdk==");
    });

    it("pypi with +-segment in version is preserved verbatim in pip URL position", () => {
        const cmd = pipInstall({
            previewPackageName: "acme-preview-acme-sdk",
            previewVersion: "0.0.1.dev1+feat.x",
            registryUrl: "https://pypi.example.com/legacy/"
        });
        expect(cmd).toContain("==0.0.1.dev1+feat.x ");
    });
});
