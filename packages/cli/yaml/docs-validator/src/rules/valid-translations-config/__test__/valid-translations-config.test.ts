import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";

import {
    getTranslationsConfigLocations,
    validateTranslationsConfig,
    validateTranslationsSourceStorage
} from "../valid-translations-config.js";

describe("validateTranslationsConfig", () => {
    it("allows supported unique locales with matching source language", () => {
        const violations = validateTranslationsConfig({
            languages: ["en", "zh"],
            settingsLanguage: "en"
        });

        expect(violations).toEqual([]);
    });

    it("rejects invalid locale tags with a direct supported-locale message", () => {
        const violations = validateTranslationsConfig({
            languages: ["en", "pt_fake_test"],
            settingsLanguage: "en"
        });

        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain('"pt_fake_test" is not a supported locale.');
        expect(violations[0]?.message).toContain("Fix in fern/docs.yml.");
        expect(violations[0]?.nodePath).toEqual([{ key: "languages", arrayIndex: 1 }]);
    });

    it("rejects unsupported locale tags", () => {
        const violations = validateTranslationsConfig({
            languages: ["en", "pt-BR"],
            settingsLanguage: "en"
        });

        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain('"pt-BR" is not a supported locale.');
        expect(violations[0]?.message).toContain("Fix in fern/docs.yml.");
        expect(violations[0]?.nodePath).toEqual([{ key: "languages", arrayIndex: 1 }]);
    });

    it("includes exact docs.yml line and column when available", async () => {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-translations-"));
        try {
            await writeFile(path.join(fernDirectory, "docs.yml"), "languages:\n  - en\n  - pt_fake_test\n");
            const locations = await getTranslationsConfigLocations(fernDirectory);

            const violations = validateTranslationsConfig({
                languages: ["en", "pt_fake_test"],
                settingsLanguage: undefined,
                locations
            });

            expect(violations).toHaveLength(1);
            expect(violations[0]?.message).toContain("Fix in fern/docs.yml:3:5.");
        } finally {
            await rm(fernDirectory, { recursive: true, force: true });
        }
    });

    it("rejects duplicate locales after canonicalization", () => {
        const violations = validateTranslationsConfig({
            languages: ["en", "zh-cn", "zh-CN"],
            settingsLanguage: "en"
        });

        expect(violations.some((violation) => violation.message.includes('Duplicate locale "zh-CN"'))).toBe(true);
    });

    it("rejects settings.language that does not match the source locale", () => {
        const violations = validateTranslationsConfig({
            languages: ["en", "zh"],
            settingsLanguage: "zh"
        });

        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain('settings.language is "zh"');
        expect(violations[0]?.message).toContain('languages[0] is "en"');
        expect(violations[0]?.message).toContain("Fix in fern/docs.yml");
        expect(violations[0]?.nodePath).toEqual(["settings", "language"]);
    });

    it("rejects advertised translated locales without source storage", async () => {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-translations-"));
        try {
            const violations = await validateTranslationsSourceStorage({
                absolutePathToFernDirectory: fernDirectory,
                languages: ["en", "zh"]
            });

            expect(violations).toHaveLength(1);
            expect(violations[0]?.message).toContain(
                "zh is listed as a locale in docs.yml, but fern/translations/zh/ is missing."
            );
            expect(violations[0]?.message).toContain("fern/\n  docs.yml\n  translations/\n    zh/ <-- missing");
        } finally {
            await rm(fernDirectory, { recursive: true, force: true });
        }
    });

    it("allows advertised translated locales with a directory even when docs.yml is missing", async () => {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-translations-"));
        try {
            await mkdir(path.join(fernDirectory, "translations", "zh"), { recursive: true });

            const violations = await validateTranslationsSourceStorage({
                absolutePathToFernDirectory: fernDirectory,
                languages: ["en", "zh"]
            });

            expect(violations).toEqual([]);
        } finally {
            await rm(fernDirectory, { recursive: true, force: true });
        }
    });

    it("rejects translation directories not advertised in languages", async () => {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-translations-"));
        try {
            await mkdir(path.join(fernDirectory, "translations", "zh"), { recursive: true });

            const violations = await validateTranslationsSourceStorage({
                absolutePathToFernDirectory: fernDirectory,
                languages: ["en"]
            });

            expect(violations).toHaveLength(1);
            expect(violations[0]?.message).toContain(
                "zh is not listed as a locale in docs.yml but is present in the translations directory."
            );
            expect(violations[0]?.message).toContain(
                "fern/\n  docs.yml\n  translations/\n    zh/ <-- not listed in docs.yml"
            );
        } finally {
            await rm(fernDirectory, { recursive: true, force: true });
        }
    });

    it("rejects unsupported translation directories", async () => {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-translations-"));
        try {
            await mkdir(path.join(fernDirectory, "translations", "pt-BR"), { recursive: true });

            const violations = await validateTranslationsSourceStorage({
                absolutePathToFernDirectory: fernDirectory,
                languages: ["en"]
            });

            expect(violations).toHaveLength(1);
            expect(violations[0]?.message).toContain(
                "pt-BR is present in the translations directory, but it is not a supported docs translation locale."
            );
            expect(violations[0]?.message).toContain(
                "fern/\n  docs.yml\n  translations/\n    pt-BR/ <-- unsupported locale"
            );
        } finally {
            await rm(fernDirectory, { recursive: true, force: true });
        }
    });

    it("allows advertised translated locales with source storage", async () => {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-translations-"));
        try {
            await mkdir(path.join(fernDirectory, "translations", "zh"), { recursive: true });

            const violations = await validateTranslationsSourceStorage({
                absolutePathToFernDirectory: fernDirectory,
                languages: ["en", "zh"]
            });

            expect(violations).toEqual([]);
        } finally {
            await rm(fernDirectory, { recursive: true, force: true });
        }
    });
});
