import { access } from "fs/promises";
import path from "path";
import type { Detection } from "../types";
import { detectAgents } from "./agents";
import { detectDocsTools } from "./docs";
import { detectFrameworks } from "./frameworks";
import { detectPackageManager, hasPackageJson, isFernCliInstalled, isPnpmWorkspaceRoot } from "./package-manager";
import { detectFernProject } from "./project";
import { detectApiSpecs } from "./specs";
import { walkFiles } from "./walk";

/**
 * Scans a repository for API specs, frameworks, docs tools, coding agents, and an existing Fern
 * project. Pass `fernCliVersion` when the Fern CLI is known to be running, to skip looking for one.
 */
export async function detectRepository(
    dir: string,
    { fernCliVersion: knownFernCliVersion }: { fernCliVersion?: string } = {}
): Promise<Detection> {
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
        knownFernCliVersion ?? isFernCliInstalled(dir),
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
    const skillFiles = [
        path.join(".agents", "skills", "fern-docs", "SKILL.md"),
        path.join(".claude", "skills", "fern-docs", "SKILL.md")
    ];
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
