import { mkdir, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";

import { validateTranslationsConfig, validateTranslationsSourceStorage } from "../valid-translations-config.js";

describe("validateTranslationsConfig", () => {
    it("allows supported unique locales with matching source language", () => {
        const violations = validateTranslationsConfig({
            languages: ["en", "zh"],
            settingsLanguage: "en"
        });

        expect(violations).toEqual([]);
    });

    it("rejects invalid BCP 47 locale tags", () => {
        const violations = validateTranslationsConfig({
            languages: ["en", "not_a_locale"],
            settingsLanguage: "en"
        });

        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("not a valid BCP 47 locale tag");
    });

    it("rejects unsupported locale tags", () => {
        const violations = validateTranslationsConfig({
            languages: ["en", "pt-BR"],
            settingsLanguage: "en"
        });

        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("not currently supported");
    });

    it("rejects duplicate locales after canonicalization", () => {
        const violations = validateTranslationsConfig({
            languages: ["en", "zh-cn", "zh-CN"],
            settingsLanguage: "en"
        });

        expect(violations.some((violation) => violation.message.includes("Duplicate translation locale"))).toBe(true);
    });

    it("rejects settings.language that does not match the source locale", () => {
        const violations = validateTranslationsConfig({
            languages: ["en", "zh"],
            settingsLanguage: "zh"
        });

        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain('settings.language is "zh"');
        expect(violations[0]?.message).toContain('languages[0] is "en"');
        expect(violations[0]?.message).toContain('set settings.language to "en"');
    });

    it("rejects advertised translated locales without source storage", async () => {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-translations-"));
        try {
            const violations = await validateTranslationsSourceStorage({
                absolutePathToFernDirectory: fernDirectory,
                languages: ["en", "zh"]
            });

            expect(violations).toHaveLength(1);
            expect(violations[0]?.message).toContain("translations/zh/ does not exist");
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
            expect(violations[0]?.message).toContain("translations/zh/ exists");
            expect(violations[0]?.message).toContain("not listed as a translated locale");
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
            expect(violations[0]?.message).toContain("translations/pt-BR/ exists");
            expect(violations[0]?.message).toContain("not a supported docs translation locale");
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
