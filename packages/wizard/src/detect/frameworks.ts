import { readFile } from "fs/promises";
import path from "path";
import type { Framework } from "../types";
import { walkFiles } from "./walk";

const FRAMEWORKS: Record<string, Framework> = {
    express: { name: "express", language: "typescript", canGenerateOpenApi: false },
    fastify: { name: "fastify", language: "typescript", canGenerateOpenApi: false },
    nestjs: { name: "nestjs", language: "typescript", canGenerateOpenApi: true },
    hono: { name: "hono", language: "typescript", canGenerateOpenApi: true },
    koa: { name: "koa", language: "typescript", canGenerateOpenApi: false },
    next: { name: "next", language: "typescript", canGenerateOpenApi: false },
    fastapi: { name: "fastapi", language: "python", canGenerateOpenApi: true },
    flask: { name: "flask", language: "python", canGenerateOpenApi: false },
    django: { name: "django", language: "python", canGenerateOpenApi: false },
    "django-rest": { name: "django-rest", language: "python", canGenerateOpenApi: true },
    rails: { name: "rails", language: "ruby", canGenerateOpenApi: false },
    grape: { name: "grape", language: "ruby", canGenerateOpenApi: false },
    gin: { name: "gin", language: "go", canGenerateOpenApi: false },
    "gorilla-mux": { name: "gorilla-mux", language: "go", canGenerateOpenApi: false },
    echo: { name: "echo", language: "go", canGenerateOpenApi: false },
    chi: { name: "chi", language: "go", canGenerateOpenApi: false },
    spring: { name: "spring", language: "java", canGenerateOpenApi: true },
    aspnet: { name: "aspnet", language: "csharp", canGenerateOpenApi: true }
};

export async function detectFrameworks(dir: string): Promise<Framework[]> {
    const files = await walkFiles(dir);
    const found = new Map<string, Framework>();
    const packageFiles = files.filter((file) => path.basename(file) === "package.json");
    for (const file of packageFiles) {
        const document = await readJson(path.join(dir, file));
        if (document === undefined) {
            continue;
        }
        for (const dependency of ["express", "fastify", "@nestjs/core", "hono", "koa", "next"]) {
            if (hasDependency(document, dependency)) {
                add(found, dependency === "@nestjs/core" ? "nestjs" : dependency);
            }
        }
    }

    for (const file of files) {
        const name = path.basename(file);
        const contents = await readText(path.join(dir, file));
        if (contents === undefined) {
            continue;
        }
        if (name === "requirements.txt" || name === "pyproject.toml") {
            for (const framework of ["fastapi", "flask", "django", "djangorestframework"]) {
                if (new RegExp(`(?:^|[\\s\"'=])${framework}(?:[\\s\"'<>=]|$)`, "im").test(contents)) {
                    add(found, framework === "djangorestframework" ? "django-rest" : framework);
                }
            }
        } else if (name === "Gemfile") {
            for (const framework of ["rails", "grape"]) {
                if (contents.includes(framework)) {
                    add(found, framework);
                }
            }
        } else if (name === "go.mod") {
            for (const [framework, marker] of [
                ["gin", "gin-gonic/gin"],
                ["gorilla-mux", "gorilla/mux"],
                ["echo", "labstack/echo"],
                ["chi", "go-chi/chi"]
            ] as const) {
                if (contents.includes(marker)) {
                    add(found, framework);
                }
            }
        } else if (name === "pom.xml" || name.startsWith("build.gradle")) {
            if (contents.includes("spring-boot")) {
                add(found, "spring");
            }
        } else if (name.endsWith(".csproj") && contents.includes("Microsoft.AspNetCore")) {
            add(found, "aspnet");
        }
    }

    return [...found.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function add(found: Map<string, Framework>, name: string): void {
    const framework = FRAMEWORKS[name];
    if (framework !== undefined) {
        found.set(name, framework);
    }
}

async function readText(filePath: string): Promise<string | undefined> {
    try {
        return await readFile(filePath, "utf8");
    } catch {
        return undefined;
    }
}

async function readJson(filePath: string): Promise<Record<string, unknown> | undefined> {
    const text = await readText(filePath);
    if (text === undefined) {
        return undefined;
    }
    try {
        const parsed: unknown = JSON.parse(text);
        return isRecord(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}

function hasDependency(document: Record<string, unknown>, dependency: string): boolean {
    for (const key of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
        const dependencies = document[key];
        if (isRecord(dependencies) && dependency in dependencies) {
            return true;
        }
    }
    return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
