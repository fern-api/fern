import { access } from "fs/promises";
import path from "path";
import { DOCS_SKILL_PATHS } from "../docs-site/skill-paths";
import type { Detection } from "../types";
import { detectAgents } from "./agents";
import { detectDocsTools } from "./docs";
import { detectFrameworks } from "./frameworks";
import { detectPackageManager, hasPackageJson, isFernCliInstalled, isPnpmWorkspaceRoot } from "./package-manager";
import { detectFernProject } from "./project";
import { detectApiSpecs } from "./specs";
import { walkFiles } from "./walk";

export async function detectRepository(dir: string): Promise<Detection> {
    const files = await walkFiles(dir);
    const [
        fernProject,
        apiSpecs,
        frameworks,
        docsTools,
        agents,
        packageManager,
        hasPackageJsonResult,
        pnpmWorkspaceRoot,
        fernCliVersion,
        docsSkillInstalled
    ] = await Promise.all([
        detectFernProject(dir),
        detectApiSpecs(dir, files),
        detectFrameworks(dir, files),
        detectDocsTools(dir, files),
        detectAgents(dir, files),
        detectPackageManager(dir),
        hasPackageJson(dir),
        isPnpmWorkspaceRoot(dir),
        isFernCliInstalled(dir),
        hasDocsSkill(dir, files)
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
        pnpmWorkspaceRoot,
        fernCliVersion,
        docsSkillInstalled
    };
}

async function hasDocsSkill(dir: string, files: string[]): Promise<boolean> {
    const skillFiles = [...new Set(Object.values(DOCS_SKILL_PATHS))].map((skillPath) =>
        path.join(skillPath, "SKILL.md")
    );
    for (const skillFile of skillFiles) {
        if (files.includes(skillFile)) {
            return true;
        }
        try {
            await access(path.join(dir, skillFile));
            return true;
        } catch {
            // The corresponding skill file is not installed.
        }
    }
    return false;
}
