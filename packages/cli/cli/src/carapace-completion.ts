#!/usr/bin/env node
/**
 * Carapace auto-completion generator for Fern CLI
 *
 * This file generates carapace completion specifications for the Fern CLI.
 * Run this file to output carapace YAML specification that can be used
 * with carapace completion system.
 *
 * Schema: https://carapace.sh/schemas/command.json
 */

import { generatorsYml } from "@fern-api/configuration";

export interface CarapaceCommand {
    name: string;
    description?: string;
    aliases?: string[];
    group?: string;
    hidden?: boolean;
    parsing?: "interspersed" | "non-interspersed" | "disabled";
    flags?: Record<string, string | { description: string; nargs?: number }>;
    persistentflags?: Record<string, string | { description: string; nargs?: number }>;
    exclusiveflags?: string[][];
    run?: string | string[];
    completion?: {
        flag?: Record<string, string[]>;
        positional?: string[][];
        positionalany?: string[];
        dash?: string[][];
        dashany?: string[];
    };
    commands?: CarapaceCommand[];
    documentation?: {
        command?: string;
        flag?: Record<string, string>;
        positional?: string[];
        positionalany?: string;
        dash?: string[];
        dashany?: string;
    };
    examples?: Record<string, string>;
}

const LOG_LEVELS = ["trace", "debug", "info", "warn", "error"];
const GENERATION_LANGUAGES = Object.values(generatorsYml.GenerationLanguage);
const CONTAINER_RUNNERS = ["docker", "podman"];
const GENERATION_MODES = ["publish", "download_files", "github"];

// Generate carapace completion spec following the official schema
function generateCarapaceSpec(): CarapaceCommand {
    return {
        name: "fern",
        description: "Fern CLI - API-first development platform",
        flags: {
            "log-level": "Set the logging level",
            version: "Print current version",
            v: "Print current version (alias)"
        },
        completion: {
            flag: {
                "log-level": LOG_LEVELS
            }
        },
        commands: [
            {
                name: "init",
                description: "Initialize a Fern API",
                flags: {
                    api: "Initialize an API",
                    docs: "Initialize a docs website",
                    organization: "Organization name",
                    org: "Organization name (alias)",
                    openapi: "Filepath or URL to an existing OpenAPI spec",
                    mintlify: "Migrate docs from Mintlify provided a path to a mint.json file",
                    readme: "Migrate docs from Readme provided a URL"
                },
                completion: {
                    flag: {
                        openapi: ["$files(*.json,*.yaml,*.yml)"],
                        mintlify: ["$files(mint.json)"]
                    }
                }
            },
            {
                name: "generate",
                description: "Generate all generators in the specified group",
                flags: {
                    api: "If multiple APIs, specify the name with --api <name>",
                    docs: "If multiple docs sites, specify the name with --docs <name>",
                    instance: "The URL for the instance of docs",
                    preview: "Whether to generate a preview link for the docs",
                    group: "The group to generate",
                    mode: "Generation mode",
                    version: "The version for the generated packages",
                    local: "Run the generator(s) locally, using Docker",
                    keepDocker: "Prevent auto-deletion of the Docker containers",
                    force: "Ignore prompts to confirm generation",
                    "broken-links": "Log a warning if there are broken links in the docs",
                    "strict-broken-links": "Throw an error if there are broken links in the docs",
                    "disable-snippets": "Disable snippets in docs generation",
                    runner: "Choose the container runtime to use for local generation",
                    "disable-dynamic-snippets": "Disable dynamic SDK snippets in docs generation",
                    prompt: "Prompt for confirmation before generating",
                    "no-prompt": "Skip confirmation prompts",
                    "skip-upload": "Skip asset upload step and generate fake links for preview",
                    fernignore: "Path to a custom .fernignore file"
                },
                completion: {
                    flag: {
                        mode: GENERATION_MODES,
                        runner: CONTAINER_RUNNERS,
                        fernignore: ["$files(.fernignore)"]
                    }
                }
            },
            {
                name: "check",
                description: "Validates your Fern Definition. Logs errors.",
                flags: {
                    api: "Only run the command on the provided API",
                    warnings: "Log warnings in addition to errors",
                    "broken-links": "Log a warning if there are broken links in the docs",
                    "strict-broken-links": "Throw an error if there are broken links in the docs",
                    local: "Run validation locally without sending data to Fern API",
                    "from-openapi": "Use the new parser and go directly from OpenAPI to IR"
                }
            },
            {
                name: "diff",
                description: "Diff two versions of an API",
                flags: {
                    from: "The previous version of the API",
                    to: "The next version of the API",
                    "from-version": "The previous version of the API (e.g. 1.1.0)",
                    "from-generator-version": "The previous version of the generator",
                    "to-generator-version": "The next version of the generator",
                    quiet: "Whether to suppress output written to stderr",
                    q: "Whether to suppress output written to stderr (alias)"
                }
            },
            {
                name: "sdk-diff",
                description: "Diff two SDK directories",
                flags: {
                    json: "Output result as JSON"
                },
                completion: {
                    positional: [["$directories"], ["$directories"]]
                }
            },
            {
                name: "add",
                description: "Add a code generator to generators.yml",
                flags: {
                    api: "Only run the command on the provided API",
                    group: "Add the generator to the specified group"
                },
                completion: {
                    positional: [
                        ["$cmdline"] // Generator name completion
                    ]
                }
            },
            {
                name: "ir",
                description: "Generate IR (Intermediate Representation)",
                flags: {
                    api: "Only run the command on the provided API",
                    version: "The version of IR to produce",
                    language: "Generate IR for a particular language",
                    audience: "Filter the IR for certain audiences",
                    "smart-casing": "Whether to use smart casing",
                    "from-openapi": "Use the new parser and go directly from OpenAPI to IR",
                    "disable-examples": "Whether to disable automatic example generation in the IR"
                },
                completion: {
                    flag: {
                        language: GENERATION_LANGUAGES
                    },
                    positional: [
                        ["$files"] // Output path
                    ]
                }
            },
            {
                name: "token",
                description: "Generate a Fern Token",
                flags: {
                    organization: "The organization to create a token for",
                    org: "The organization to create a token for (alias)"
                }
            },
            {
                name: "login",
                description: "Log in to Fern via GitHub",
                flags: {
                    "device-code": "Use device code authorization"
                }
            },
            {
                name: "logout",
                description: "Log out of Fern"
            },
            {
                name: "format",
                description: "Formats your Fern Definition",
                flags: {
                    ci: "Fail with non-zero exit status if files are not formatted correctly",
                    api: "Only run the command on the provided API"
                }
            },
            {
                name: "mock",
                description: "Starts a mock server for an API",
                flags: {
                    port: "The port the server binds to",
                    api: "The API to mock"
                }
            },
            {
                name: "test",
                description: "Runs tests with a mock server in the background",
                flags: {
                    api: "The API to mock",
                    command: "The command to run to test your SDK",
                    language: "Run the tests configured to a specific language"
                },
                completion: {
                    flag: {
                        language: GENERATION_LANGUAGES
                    }
                }
            },
            {
                name: "upgrade",
                description: "Upgrades Fern CLI version in fern.config.json",
                flags: {
                    version: "The version to upgrade to. Defaults to the latest release",
                    from: "The version to migrate from",
                    yes: "Automatically answer yes to migration prompts",
                    y: "Automatically answer yes to migration prompts (alias)"
                }
            },
            {
                name: "downgrade",
                description: "Downgrades Fern CLI version in fern.config.json",
                completion: {
                    positional: [
                        ["$cmdline"] // Version to downgrade to
                    ]
                }
            },
            {
                name: "self-update",
                description: "Updates the globally installed Fern CLI to the latest version",
                flags: {
                    "dry-run": "Show what would be executed without running the update"
                },
                completion: {
                    positional: [
                        ["$cmdline"] // Optional version
                    ]
                }
            },
            {
                name: "api",
                description: "Commands for managing APIs",
                commands: [
                    {
                        name: "update",
                        description: "Pulls the latest OpenAPI spec from the specified origin",
                        flags: {
                            api: "The API to update the spec for"
                        }
                    }
                ]
            },
            {
                name: "docs",
                description: "Commands for managing your docs",
                commands: [
                    {
                        name: "dev",
                        description: "Run a local development server to preview your docs",
                        flags: {
                            port: "Run the development server on the following port",
                            "broken-links": "Check for broken links in your docs",
                            beta: "Run the app router development server",
                            legacy: "Run the legacy development server",
                            "backend-port": "Run the development backend server on the following port"
                        }
                    },
                    {
                        name: "broken-links",
                        description: "Check for broken links in your docs",
                        flags: {
                            strict: "Fail with non-zero exit status"
                        }
                    },
                    {
                        name: "delete",
                        description: "Delete a preview docs deployment",
                        flags: {
                            all: "Delete all preview deployments",
                            confirm: "Skip confirmation prompt"
                        },
                        completion: {
                            positional: [
                                // Dynamic completion that lists preview sites
                                // This would need to be implemented to call a command that lists preview deployments
                                [
                                    "$(fern docs list --format=completion 2>/dev/null || echo 'preview-site-1 preview-site-2')"
                                ]
                            ]
                        }
                    },
                    {
                        name: "list",
                        description: "List preview docs deployments",
                        flags: {
                            format: "Output format (table, json, completion)"
                        }
                    }
                ]
            },
            {
                name: "write-definition",
                description: "Write underlying Fern Definition for OpenAPI specs and API Dependencies",
                flags: {
                    api: "Only run the command on the provided API",
                    language: "Write the definition for a particular SDK language",
                    "preserve-schemas": "Preserve potentially unsafe schema Ids in the generated fern definition"
                },
                completion: {
                    flag: {
                        language: GENERATION_LANGUAGES
                    }
                }
            },
            {
                name: "write-overrides",
                description: "Generate a basic openapi overrides file",
                flags: {
                    api: "Only run the command on the provided API",
                    "exclude-models": "When generating the initial overrides, also stub the models"
                }
            },
            {
                name: "export",
                description: "Export your API to an OpenAPI spec",
                flags: {
                    api: "Only run the command on the provided API"
                },
                completion: {
                    positional: [
                        ["$files"] // Output path
                    ]
                }
            },
            {
                name: "jsonschema",
                description: "Generate JSON Schema for a specific type",
                flags: {
                    api: "Only run the command on the provided API",
                    type: "The type to generate JSON Schema for"
                },
                completion: {
                    positional: [
                        ["$files"] // Output path
                    ]
                }
            },
            {
                name: "write-translation",
                description: "Generate translation directories for each language defined in docs.yml",
                flags: {
                    stub: "Return content as-is without calling the translation service",
                    s: "Return content as-is without calling the translation service (alias)"
                }
            }
        ]
    };
}

// Generate YAML output for carapace following the official schema
export function generateCarapaceYAML(): string {
    const spec = generateCarapaceSpec();

    // Convert to YAML manually to maintain proper formatting and schema reference
    function toYaml(obj: any, indent = 0): string {
        const spaces = "  ".repeat(indent);
        let result = "";

        for (const [key, value] of Object.entries(obj)) {
            if (value === null || value === undefined) {
                continue;
            }

            if (Array.isArray(value)) {
                if (value.length === 0) {
                    result += `${spaces}${key}: []\n`;
                } else {
                    result += `${spaces}${key}:\n`;
                    for (const item of value) {
                        if (typeof item === "string") {
                            // Handle special carapace completion strings (starting with $ or containing $())
                            if (item.startsWith("$") || item.includes("$(")) {
                                result += `${spaces}  - ${item}\n`;
                            } else {
                                result += `${spaces}  - ${item}\n`;
                            }
                        } else if (typeof item === "object") {
                            result += `${spaces}  -\n`;
                            result += toYaml(item, indent + 2);
                        } else if (Array.isArray(item)) {
                            const arrayContent = item
                                .map((i) => {
                                    if (typeof i === "string" && (i.startsWith("$") || i.includes("$("))) {
                                        return i; // Don't quote special completion strings
                                    }
                                    return typeof i === "string" ? `"${i}"` : String(i);
                                })
                                .join(", ");
                            result += `${spaces}  - [${arrayContent}]\n`;
                        }
                    }
                }
            } else if (typeof value === "object") {
                result += `${spaces}${key}:\n`;
                result += toYaml(value, indent + 1);
            } else if (typeof value === "string") {
                // Don't escape special carapace completion strings
                if (value.startsWith("$") || value.includes("$(")) {
                    result += `${spaces}${key}: ${value}\n`;
                } else {
                    // Escape strings that might need quoting
                    const needsQuotes =
                        value.includes(":") ||
                        value.includes("#") ||
                        value.includes("'") ||
                        value.includes('"') ||
                        value.includes("\n");
                    if (needsQuotes) {
                        result += `${spaces}${key}: "${value.replace(/"/g, '\\"')}"\n`;
                    } else {
                        result += `${spaces}${key}: ${value}\n`;
                    }
                }
            } else {
                result += `${spaces}${key}: ${value}\n`;
            }
        }

        return result;
    }

    // Add schema reference at the top
    const schemaHeader = "# yaml-language-server: $schema=https://carapace.sh/schemas/command.json\n";
    return schemaHeader + toYaml(spec);
}

// Main function when run directly
if (require.main === module) {
    // biome-ignore lint: CLI script output
    console.log(generateCarapaceYAML());
}
