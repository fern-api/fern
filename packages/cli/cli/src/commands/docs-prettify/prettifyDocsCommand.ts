/**
 * Docs Prettify Command
 *
 * Analyzes markdown documentation files and suggests improvements using Fern components.
 * Uses an LLM (via BAML) to intelligently enhance documentation with:
 * - Steps for sequential content
 * - Cards for navigation and feature showcases
 * - Callouts for important information
 * - Code blocks with syntax highlighting and tabs
 * - Endpoint snippets for API references
 * - And more...
 */

import { b as BamlClient, PrettifiedDocsResponse } from "@fern-api/cli-ai";
import { AbsoluteFilePath, cwd, doesPathExist, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { readdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";
import { CliContext } from "../../cli-context/CliContext";

const FERN_COMPONENTS_REFERENCE = `# Fern Documentation Components Reference

This file contains examples of all available Fern documentation components that can be used to enhance markdown content.

## Code Blocks

### Basic Code Block
\`\`\`typescript
import { PlantClient } from "@plantstore/sdk";

const client = new PlantClient({ apiKey: "YOUR_API_KEY" });
const plant = await client.plants.create({
  name: "Monstera",
  species: "Monstera deliciosa"
});
\`\`\`

### Code Block with Title
\`\`\`python title="Create a plant"
from plantstore import PlantClient

client = PlantClient(api_key="YOUR_API_KEY")
plant = client.plants.create(
    name="Monstera",
    species="Monstera deliciosa"
)
\`\`\`

### Code Block with Line Highlighting
\`\`\`javascript {2-4}
console.log("Line 1");
console.log("Line 2 - highlighted");
console.log("Line 3 - highlighted");
console.log("Line 4 - highlighted");
console.log("Line 5");
\`\`\`

### Code Blocks with Tabs (Multiple Languages)
<CodeBlocks>
  \`\`\`python title="Python"
  print("Hello World")
  \`\`\`

  \`\`\`typescript title="TypeScript"
  console.log("Hello World");
  \`\`\`

  \`\`\`go title="Go"
  fmt.Println("Hello World")
  \`\`\`
</CodeBlocks>

## Steps

Use steps for sequential instructions, tutorials, or walkthroughs:

<Steps>
  <Step title="Install the SDK">
    First, install the Plants API SDK using your package manager.
    
    \`\`\`bash
    npm install @plantstore/sdk
    \`\`\`
  </Step>
  <Step title="Get your API key">
    Sign up for a Plants API account and generate your API key from the dashboard.
  </Step>
  <Step title="Initialize the client">
    Import and set up the Plants client to start making API calls.
    
    \`\`\`typescript
    import { PlantClient } from "@plantstore/sdk";
    
    const client = new PlantClient({ apiKey: "YOUR_API_KEY" });
    \`\`\`
  </Step>
</Steps>

## Cards

### Single Card
<Card 
    title="Getting started" 
    icon="regular rocket" 
    href="/docs/getting-started"
>
    Learn how to get started with the Plants API
</Card>

### Card Group
<CardGroup cols={2}>
  <Card 
    title="Authentication" 
    icon="regular key" 
    href="/docs/authentication"
  >
    Learn how to authenticate your API requests
  </Card>
  <Card 
    title="Rate limits" 
    icon="regular gauge" 
    href="/docs/rate-limits"
  >
    Understand API rate limits and best practices
  </Card>
</CardGroup>

## Callouts

### Info Callout
<Info>
  This is an informational callout to highlight important information.
</Info>

### Note Callout
<Note title="Important note">
  Use note callouts to draw attention to important details or caveats.
</Note>

### Warning Callout
<Warning>
  Warning callouts alert users to potential issues or important considerations.
</Warning>

### Tip Callout
<Tip>
  Tip callouts provide helpful suggestions and best practices.
</Tip>

## Accordions

<AccordionGroup>
  <Accordion title="What is a plant API?">
    A plant API allows you to programmatically access plant data, care instructions, and tracking features.
  </Accordion>
  <Accordion title="How do I get started?">
    Sign up for an account, get your API key, and install one of our SDKs to start making requests.
  </Accordion>
</AccordionGroup>

## Tabs

<Tabs>
  <Tab title="TypeScript">
    \`\`\`typescript
    import { PlantClient } from "@plantstore/sdk";
    
    const client = new PlantClient({ apiKey: "YOUR_API_KEY" });
    \`\`\`
  </Tab>
  <Tab title="Python">
    \`\`\`python
    from plantstore import PlantClient
    
    client = PlantClient(api_key="YOUR_API_KEY")
    \`\`\`
  </Tab>
</Tabs>

## Endpoint Request Snippet

Reference API endpoints from your API specification:

<EndpointRequestSnippet endpoint="POST /plants/{plantId}" />

## Tables

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| API Requests | 1,000/month | 100,000/month | Unlimited |
| Rate Limit | 10/second | 100/second | Custom |
| Support | Community | Email | Dedicated |

## Parameter Fields

<ParamField path="name" type="string" required={true}>
  The name of the plant
</ParamField>

<ParamField path="species" type="string" required={false}>
  The scientific species name
</ParamField>
`;

interface PrettifyDocsOptions {
    context: CliContext;
    path: string;
    dryRun: boolean;
}

/**
 * Discovers all markdown files in a directory recursively
 */
async function discoverMarkdownFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name.startsWith(".")) {
                continue;
            }
            const subFiles = await discoverMarkdownFiles(fullPath);
            files.push(...subFiles);
        } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Prettifies a single markdown file using the LLM
 */
async function prettifyFile({
    filePath,
    context,
    dryRun
}: {
    filePath: string;
    context: TaskContext;
    dryRun: boolean;
}): Promise<void> {
    const relativePath = path.relative(cwd(), filePath);
    context.logger.info(chalk.cyan(`Processing: ${relativePath}`));

    try {
        const content = await readFile(filePath, "utf-8");

        if (content.trim().length === 0) {
            context.logger.warn(chalk.yellow(`  Skipping empty file`));
            return;
        }

        context.logger.debug("  Analyzing with LLM...");
        const result: PrettifiedDocsResponse = await BamlClient.PrettifyDocs(content, FERN_COMPONENTS_REFERENCE);

        if (result.improved_markdown.trim() === content.trim()) {
            context.logger.info(chalk.gray(`  No changes suggested`));
            return;
        }

        context.logger.info(chalk.green(`  Changes:`));
        const summaryLines = result.changes_summary.split("\n");
        for (const line of summaryLines) {
            if (line.trim()) {
                context.logger.info(chalk.gray(`    ${line.trim()}`));
            }
        }

        if (dryRun) {
            context.logger.info(chalk.yellow(`  [DRY RUN] Would update file`));
            context.logger.debug(`\n${chalk.dim("--- Original ---")}\n${content.substring(0, 500)}...`);
            context.logger.debug(
                `\n${chalk.dim("--- Improved ---")}\n${result.improved_markdown.substring(0, 500)}...`
            );
        } else {
            await writeFile(filePath, result.improved_markdown, "utf-8");
            context.logger.info(chalk.green(`  ✓ File updated`));
        }
    } catch (error) {
        context.logger.error(
            chalk.red(`  Failed to process file: ${error instanceof Error ? error.message : String(error)}`)
        );
    }
}

/**
 * Main command handler for docs prettify
 */
export async function prettifyDocsCommand({ context, path: inputPath, dryRun }: PrettifyDocsOptions): Promise<void> {
    const absolutePath = AbsoluteFilePath.of(resolve(cwd(), inputPath));

    if (!(await doesPathExist(absolutePath))) {
        context.failAndThrow(`Path not found: ${absolutePath}`);
    }

    const stats = await stat(absolutePath);
    const isDirectory = stats.isDirectory();

    if (dryRun) {
        context.logger.info(chalk.yellow("Running in DRY RUN mode - no files will be modified\n"));
    }

    await context.runTask(async (taskContext) => {
        if (isDirectory) {
            taskContext.logger.info(`Discovering markdown files in: ${absolutePath}`);
            const files = await discoverMarkdownFiles(absolutePath);

            if (files.length === 0) {
                taskContext.logger.warn("No markdown files found");
                return;
            }

            taskContext.logger.info(`Found ${files.length} markdown file(s)\n`);

            for (const file of files) {
                await prettifyFile({ filePath: file, context: taskContext, dryRun });
            }
        } else {
            if (!absolutePath.endsWith(".md") && !absolutePath.endsWith(".mdx")) {
                context.failAndThrow("File must be a markdown file (.md or .mdx)");
            }

            await prettifyFile({ filePath: absolutePath, context: taskContext, dryRun });
        }
    });

    if (dryRun) {
        context.logger.info(chalk.yellow("\n✓ Dry run complete. Run without --dry-run to apply changes."));
    } else {
        context.logger.info(chalk.green("\n✓ Prettification complete!"));
    }
}
