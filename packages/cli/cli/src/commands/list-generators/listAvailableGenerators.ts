import { FernRegistryClient as GeneratorsClient } from "@fern-fern/generators-sdk";
import { GeneratorLanguage } from "@fern-fern/generators-sdk/api/resources/generators";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";

import { CliContext } from "../../cli-context/CliContext.js";

interface GeneratorRow {
    id: string;
    name: string;
    type: string;
    language: string;
    dockerImage: string;
}

export async function listAvailableGenerators({
    cliContext,
    languageFilter,
    typeFilter,
    format,
    outputLocation
}: {
    cliContext: CliContext;
    languageFilter: string | undefined;
    typeFilter: string | undefined;
    format: "table" | "json" | "yaml";
    outputLocation: string | undefined;
}): Promise<void> {
    const fdrOrigin = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com";
    const client = new GeneratorsClient({
        environment: fdrOrigin
    });

    cliContext.logger.debug(`Fetching available generators from ${fdrOrigin}...`);

    const response = await client.generators.listGenerators();
    if (!response.ok) {
        cliContext.failAndThrow("Failed to fetch generators from the registry. Please check your network connection.");
        return;
    }

    let generators = response.body;

    // Filter by language
    if (languageFilter != null) {
        const normalizedLanguage = languageFilter.toLowerCase();
        const validLanguages = Object.values(GeneratorLanguage);
        if (!validLanguages.includes(normalizedLanguage as GeneratorLanguage)) {
            cliContext.failAndThrow(
                `Invalid language "${languageFilter}". Valid languages are: ${validLanguages.join(", ")}`
            );
            return;
        }
        generators = generators.filter(
            (g) => g.generatorLanguage != null && g.generatorLanguage === normalizedLanguage
        );
    }

    // Filter by type
    if (typeFilter != null) {
        const normalizedType = typeFilter.toLowerCase();
        const validTypes = ["sdk", "model", "server", "other"];
        if (!validTypes.includes(normalizedType)) {
            cliContext.failAndThrow(
                `Invalid type "${typeFilter}". Valid types are: ${validTypes.join(", ")}`
            );
            return;
        }
        generators = generators.filter((g) => g.generatorType.type === normalizedType);
    }

    if (generators.length === 0) {
        cliContext.logger.info("No generators found matching the specified filters.");
        return;
    }

    const rows: GeneratorRow[] = generators.map((g) => ({
        id: g.id,
        name: g.displayName,
        type: g.generatorType.type,
        language: g.generatorLanguage ?? "n/a",
        dockerImage: g.dockerImage
    }));

    // Sort by language then by type for consistent output
    rows.sort((a, b) => {
        const langCompare = a.language.localeCompare(b.language);
        if (langCompare !== 0) {
            return langCompare;
        }
        return a.type.localeCompare(b.type);
    });

    let output: string;
    switch (format) {
        case "json":
            output = JSON.stringify(rows, null, 2);
            break;
        case "yaml":
            output = yaml.dump(rows);
            break;
        case "table":
        default:
            output = formatTable(rows);
            break;
    }

    if (outputLocation != null) {
        try {
            await writeFile(outputLocation, output);
            cliContext.logger.info(`Generator list written to ${outputLocation}`);
        } catch (error) {
            cliContext.failAndThrow(`Could not write file to the specified location: ${outputLocation}`, error);
        }
    } else {
        process.stdout.write(output + "\n");
    }
}

function formatTable(rows: GeneratorRow[]): string {
    const headers = ["ID", "Name", "Type", "Language", "Docker Image"];
    const keys: (keyof GeneratorRow)[] = ["id", "name", "type", "language", "dockerImage"];

    // Calculate column widths
    const widths = headers.map((header, i) => {
        const key = keys[i];
        if (key == null) {
            return header.length;
        }
        return Math.max(header.length, ...rows.map((row) => String(row[key]).length));
    });

    const separator = widths.map((w) => "-".repeat(w)).join(" | ");
    const headerRow = headers.map((h, i) => h.padEnd(widths[i] ?? h.length)).join(" | ");
    const dataRows = rows.map((row) => keys.map((key, i) => String(row[key]).padEnd(widths[i] ?? 0)).join(" | "));

    return [headerRow, separator, ...dataRows].join("\n");
}
