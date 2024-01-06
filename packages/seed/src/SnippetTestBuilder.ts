import { GenerationLanguage } from "@fern-api/generators-configuration";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import fs from "fs/promises";
import path from "path";
import tmp from "tmp-promise";


export class SnippetTestBuilder {
    public language: GenerationLanguage;

    constructor(language: GenerationLanguage) {
        this.language = language;
    }

    async buildSnippetTests(snippets: FernGeneratorExec.Snippets): Promise<tmp.DirectoryResult[]> {
        const directories: tmp.DirectoryResult[] = [];
        for (const endpointSnippet of snippets.endpoints) {
            if (endpointSnippet.snippet.type !== this.language) {
                for (const dir of directories) {
                    await dir.cleanup();
                }
                throw new Error(`Failed to build snippet tests; expected language ${this.language}, but found snippet with language ${endpointSnippet.snippet.type}`);
            }
            const dir = await tmp.dir({unsafeCleanup: true});
            switch (endpointSnippet.snippet.type) {
                case "python": await this.buildSnippetForPython(dir, endpointSnippet.snippet);
            }
            directories.push(dir);
        }
        return directories;
    }

    async buildSnippetForPython(
        dir: tmp.DirectoryResult,
        snippet: FernGeneratorExec.PythonEndpointSnippet,
    ): Promise<void> {
        // This is prone to drift - if we change any of these values in fern-python, we'll
        // need to update these values, too.
        //
        // However, copying the pyproject.toml from the generated output also isn't ideal
        // because it requires find/replacing values that must be unique (i.e. we would
        // need to update the 'name' and remove the 'packages' field in the tools.poetry
        // section for this to work, as well as add the 'seed' dependency override in
        // the tool.poetry.dependencies section.
        //
        // Although less than ideal, including a separate copy of the pyproject.toml
        // that only specifies the values we need is simplest.
        await fs.writeFile(
            path.join(dir.path, "pyproject.toml"),
            [
                "[tool.poetry]",
                "name = \"snippet\"",
                "version = \"0.0.0\"",
                "description = \"\"",
                "authors = []",
                "",
                "[tool.poetry.dependencies]",
                "python = \"^3.7\"",
                "seed = { path = \"/generated\" }",
                "",
                "[tool.poetry.dev-dependencies]",
                "mypy = \"0.971\"",
                "pytest = \"^7.4.0\"",
            ].join("\n"),
        );
        await fs.mkdir(path.join(dir.path, "src"));
        await fs.writeFile(
            path.join(dir.path, "src", "sync_client.py"),
            snippet.syncClient,
        );
        await fs.writeFile(
            path.join(dir.path, "src", "async_client.py"),
            formatAsyncPythonSnippet(snippet.asyncClient),
        );
    }
}

// formatAsyncPythonSnippet formats the string as an async Python snippet (i.e. surrounds
// any 'await' calls in an 'async' function definition) so that the code can be validated
// against the configured seed scripts (e.g. mypy).
function formatAsyncPythonSnippet(s: string): string {
    return "async def run():\n" + addIndentPrefix(s);
}

// addIndentPrefix adds four spaces to every line in the given string.
function addIndentPrefix(s: string): string {
    // Add a tab (\t) before each newline (\n) character, excluding the last one.
    const formattedLines: string[] = s.split("\n").slice(0, -1).map(line => `    ${line}`);
    return formattedLines.join("\n");
}
