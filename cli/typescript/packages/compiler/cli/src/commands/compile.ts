import { SyntaxAnalysis } from "@fern/syntax-analysis";
import { compile, Compiler } from "@usebirch/compiler";
import { FernFile, RelativeFilePath } from "@usebirch/compiler-commons";
import chalk from "chalk";
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { ZodIssue, ZodIssueCode } from "zod";

export async function compileCommand({
    inputDirectory,
    output,
}: {
    inputDirectory: string;
    output: string;
}): Promise<void> {
    const filepaths = await getAllYamlFiles(inputDirectory);
    const files: FernFile[] = [];
    for (const filepath of filepaths) {
        try {
            files.push({
                package: filepath,
                fileContents: (await readFile(path.join(inputDirectory, filepath))).toString(),
            });
        } catch (e) {
            console.error("Failed to read file", filepath);
        }
    }

    const compileResult = await compile(files);

    if (compileResult.didSucceed) {
        console.log(chalk.green("Parsed successfully!"));
        await writeFile(output, JSON.stringify(compileResult));
    } else {
        switch (compileResult.failure.type) {
            case Compiler.FailureType.SYNTAX_ANALYSIS:
                for (const [relativeFilePath, failure] of Object.entries(compileResult.failure.failures)) {
                    switch (failure.type) {
                        case SyntaxAnalysis.FailureType.FILE_READ:
                            console.error("Failed to open file", relativeFilePath);
                            break;
                        case SyntaxAnalysis.FailureType.FILE_PARSE:
                            console.error("Failed to parse file", relativeFilePath);
                            break;
                        case SyntaxAnalysis.FailureType.STRUCTURE_VALIDATION:
                            for (const issue of failure.error.issues) {
                                for (const { title, subtitle } of parseIssue(issue)) {
                                    console.group(chalk.bold.red(`Validation error: ${title}`));
                                    if (subtitle != null) {
                                        console.log(subtitle);
                                    }
                                    console.log(chalk.blue([relativeFilePath, ...issue.path].join(" -> ")));
                                    console.log();
                                    console.groupEnd();
                                }
                            }
                            break;
                    }
                }
                break;
            case Compiler.FailureType.IR_GENERATION:
                console.error("Failed to genrate intermediate representation.");
                break;
        }
    }
}

interface ParsedIssue {
    title: string;
    subtitle?: string;
}

function parseIssue(issue: ZodIssue): ParsedIssue[] {
    switch (issue.code) {
        case ZodIssueCode.invalid_type:
            return [
                {
                    title: "Incorrect type",
                    subtitle: `Expected ${chalk.underline(issue.expected)} but received ${chalk.underline(
                        issue.received
                    )}`,
                },
            ];
        case ZodIssueCode.unrecognized_keys:
            return issue.keys.map((key) => ({
                title: "Unexpected key",
                subtitle: `Encountered unexpected key ${chalk.underline(key)}`,
            }));
        case ZodIssueCode.invalid_enum_value:
            return [
                {
                    title: "Unrecognized value",
                    subtitle: `Allowed values: ${issue.options.map((option) => chalk.underline(option)).join(", ")}`,
                },
            ];
        case ZodIssueCode.invalid_union:
        case ZodIssueCode.invalid_arguments:
        case ZodIssueCode.invalid_return_type:
        case ZodIssueCode.invalid_date:
        case ZodIssueCode.invalid_string:
        case ZodIssueCode.too_small:
        case ZodIssueCode.too_big:
        case ZodIssueCode.invalid_intersection_types:
        case ZodIssueCode.not_multiple_of:
        case ZodIssueCode.custom:
        default:
            return [{ title: issue.message }];
    }
}

async function getAllYamlFiles(fullDirectoryPath: string): Promise<RelativeFilePath[]> {
    const files: RelativeFilePath[] = [];

    const directoryContents = await readdir(fullDirectoryPath, {
        withFileTypes: true,
    });

    for (const item of directoryContents) {
        if (item.isFile()) {
            if (item.name.endsWith(".yml")) {
                files.push(item.name);
            }
        } else if (item.isDirectory()) {
            const yamlFilesInDirectory = await getAllYamlFiles(path.join(fullDirectoryPath, item.name));
            files.push(...yamlFilesInDirectory.map((yamlFile) => path.join(item.name, yamlFile)));
        }
    }

    return files;
}
