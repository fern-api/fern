import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import { getThirdPartyImports, maybeBundleMdxComponent } from "../bundleMdxComponent.js";

const context = createMockTaskContext();

describe("getThirdPartyImports", () => {
    it("detects bare imports", () => {
        expect(
            getThirdPartyImports(`
                import confetti from "canvas-confetti";
                import { format } from "date-fns/format";
                import * as lodash from "lodash-es";
            `)
        ).toEqual(["canvas-confetti", "date-fns/format", "lodash-es"]);
    });

    it("ignores relative imports and renderer-provided modules", () => {
        expect(
            getThirdPartyImports(`
                import React from "react";
                import { useState } from "react";
                import { jsx } from "react/jsx-runtime";
                import { createRoot } from "react-dom/client";
                import { MDXProvider } from "@mdx-js/react";
                import Image from "next/image";
                import { Other } from "./Other";
                import { Helper } from "../utils/helper";
                export { Something } from "./Something";
            `)
        ).toEqual([]);
    });

    it("detects bare re-exports", () => {
        expect(
            getThirdPartyImports(`
                export * from "some-lib";
                export { thing } from "@scope/other-lib";
            `)
        ).toEqual(["some-lib", "@scope/other-lib"]);
    });

    it("detects dynamic imports and requires", () => {
        expect(
            getThirdPartyImports(`
                const lib = await import("some-lib");
                const other = require("other-lib");
            `)
        ).toEqual(["some-lib", "other-lib"]);
    });

    it("returns empty for code without imports", () => {
        expect(getThirdPartyImports("export const Foo = () => null;")).toEqual([]);
    });
});

describe("maybeBundleMdxComponent", () => {
    it("returns undefined for files without third-party imports", async () => {
        const result = await maybeBundleMdxComponent({
            absoluteFilePath: AbsoluteFilePath.of("/project/components/Foo.tsx"),
            contents: `import React from "react";\nexport const Foo = () => <div>hello</div>;`,
            context
        });
        expect(result).toBeUndefined();
    });

    it("returns undefined for markdown files", async () => {
        const result = await maybeBundleMdxComponent({
            absoluteFilePath: AbsoluteFilePath.of("/project/components/notes.mdx"),
            contents: `import something from "some-lib";`,
            context
        });
        expect(result).toBeUndefined();
    });

    it("inlines third-party imports resolved from node_modules", async () => {
        const { path: projectDir, cleanup } = await tmp.dir({ unsafeCleanup: true });
        try {
            const packageDir = path.join(projectDir, "node_modules", "fake-greeting-lib");
            await mkdir(packageDir, { recursive: true });
            await writeFile(
                path.join(packageDir, "package.json"),
                JSON.stringify({ name: "fake-greeting-lib", version: "1.0.0", main: "index.js" })
            );
            await writeFile(
                path.join(packageDir, "index.js"),
                `export function greet(name) { return "MARKER_FROM_FAKE_LIB " + name; }`
            );

            const componentsDir = path.join(projectDir, "components");
            await mkdir(componentsDir, { recursive: true });
            const componentPath = path.join(componentsDir, "Greeting.tsx");
            const contents = [
                `import React from "react";`,
                `import { greet } from "fake-greeting-lib";`,
                `import { LOCAL_CONSTANT } from "./constants";`,
                ``,
                `export const Greeting: React.FC<{ name: string }> = ({ name }) => {`,
                `    return <div>{greet(name)} {LOCAL_CONSTANT}</div>;`,
                `};`
            ].join("\n");
            await writeFile(componentPath, contents);
            await writeFile(path.join(componentsDir, "constants.ts"), `export const LOCAL_CONSTANT = "local";`);

            const bundled = await maybeBundleMdxComponent({
                absoluteFilePath: AbsoluteFilePath.of(componentPath),
                contents,
                context
            });

            expect(bundled).toBeDefined();
            // The third-party library is inlined
            expect(bundled).toContain("MARKER_FROM_FAKE_LIB");
            expect(bundled).not.toContain(`from "fake-greeting-lib"`);
            // Renderer-provided modules and relative imports stay external
            expect(bundled).toContain("react");
            expect(bundled).toContain("./constants");
        } finally {
            await cleanup();
        }
    }, 120_000);
});
