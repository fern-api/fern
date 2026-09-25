import type { Detection } from "../types";
import { detectAgents } from "./agents";
import { detectDocsTools } from "./docs";
import { detectFrameworks } from "./frameworks";
import { detectPackageManager, hasPackageJson, isFernCliInstalled } from "./package-manager";
import { detectFernProject } from "./project";
import { detectApiSpecs } from "./specs";
import { walkFiles } from "./walk";

export async function detectRepository(dir: string, checkCli = true): Promise<Detection> {
    const files = await walkFiles(dir);
    const [fernProject, apiSpecs, frameworks, docsTools, agents, packageManager, hasPackageJsonResult, fernCliVersion] =
        await Promise.all([
            detectFernProject(dir),
            detectApiSpecs(dir, files),
            detectFrameworks(dir, files),
            detectDocsTools(dir, files),
            detectAgents(dir, files),
            detectPackageManager(dir),
            hasPackageJson(dir),
            checkCli ? isFernCliInstalled() : Promise.resolve(null)
        ]);
    return {
        dir,
        fernProject,
        apiSpecs,
        frameworks,
        docsTools,
        agents,
        packageManager,
        hasPackageJson: hasPackageJsonResult,
        fernCliVersion
    };
}
