import { Project } from "@lerna/project";
import { exec } from "child_process";
import { RmOptions } from "fs";
import { mkdir, readFile, rename, rm, writeFile } from "fs/promises";
import path from "path";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import { logError, logSuccess, logWarning, PRIMARY_WRITER } from "./logger";
import { getPackagesByName, isBundle } from "./utils";
import { writePackageFiles } from "./writePackageFiles";

const promisifiedExec = promisify(exec);

// TODO: support different types
//   - react app
//   - react library
//   - typescript library
//   - cli

export async function createPackage(packageName: string): Promise<void> {
    logStartMessage({ packageName });

    if (!packageName.startsWith("@")) {
        logError({
            packageName,
            message: "Package name must include a scope",
        });
        process.exit(1);
    }
    const nameWithoutScope = packageName.replace(/^@[^/]+\//, "");

    const { rootPath } = new Project();
    const packagePath = path.join(rootPath, "packages", nameWithoutScope);

    async function removeFile(relativePath: string, opts?: RmOptions): Promise<void> {
        await rm(path.join(packagePath, relativePath), opts);
    }

    // make package
    try {
        await mkdir(packagePath);
    } catch (error) {
        logError({
            packageName,
            message: "A package with this name already exists.",
            additionalContent: JSON.stringify(error),
        });
        process.exit(1);
    }

    try {
        if (isBundle(packageName)) {
            const tempName = uuidv4();
            await promisifiedExec(`cd packages && yarn run create-react-app --template typescript ${tempName}`);
            await rename(path.join(process.cwd(), "packages", tempName), packagePath);
            logSuccess({
                packageName,
                message: "Created package using create-react-app",
            });
            logWarning({
                packageName,
                message: "Don't forget to edit deploy.ts with your package details",
            });

            // update package.json
            const pathToPackageJson = path.join(packagePath, "package.json");
            const packageJsonContents = JSON.parse((await readFile(pathToPackageJson)).toString());
            // new name
            packageJsonContents.name = packageName;
            // remove non-react dependencies
            const { react, ["react-dom"]: reactDom } = packageJsonContents.dependencies;
            packageJsonContents.dependencies = {
                react,
                "react-dom": reactDom,
            };
            await writeFile(pathToPackageJson, JSON.stringify(packageJsonContents));

            // remove unwanted files
            await Promise.all([
                removeFile("node_modules", { recursive: true }),
                removeFile(".gitignore"),
                removeFile("README.md"),
                removeFile("package-lock.json"),
                removeFile("src/App.tsx"),
                removeFile("src/App.test.tsx"),
                removeFile("src/App.css"),
                removeFile("src/index.css"),
                removeFile("src/logo.svg"),
                removeFile("src/reportWebVitals.ts"),
            ]);

            // rewrite index.tsx
            await writeFile(
                path.join(packagePath, "src/index.tsx"),
                `import React from "react";
import ReactDOM from "react-dom";
            
ReactDOM.render(
    <React.StrictMode>
        <div>Hello world.</div>
    </React.StrictMode>,
    document.getElementById("root")
);`
            );
        } else {
            // make package.json
            await writeFile(
                path.join(packagePath, "package.json"),
                JSON.stringify({
                    name: packageName,
                })
            );

            // make src
            const srcPath = path.join(packagePath, "src");
            await mkdir(srcPath);
            await writeFile(path.join(srcPath, "index.ts"), "export {};");
        }

        const packagesByName = getPackagesByName(await Project.getPackages());
        const lernaPackage = packagesByName[packageName];
        if (lernaPackage == null) {
            throw new Error("Package not detected by lerna");
        }

        const result = await writePackageFiles({
            lernaPackage,
            packagesByName,
            shouldFix: true,
        });
        if (!result.isSuccess) {
            throw new Error("Failed to write package files");
        }
    } catch (error) {
        logError({
            packageName,
            message: "Failed to create package.",
            additionalContent: JSON.stringify(error),
        });
        await rm(packagePath, { recursive: true });
        process.exit(1);
    }

    await promisifiedExec("yarn install").catch();
}

export function logStartMessage({ packageName }: { packageName: string }): void {
    console.log(PRIMARY_WRITER(`Creating package: ${packageName}`));
}
