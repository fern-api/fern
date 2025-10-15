import { fileURLToPath } from "url";
import { generateAllSdkFixtures } from "./fixtureHelpers";

/**
 * Generate all SDK fixture variations for testing using pnpm seed run
 */
export async function generateAllFixtures(): Promise<void> {
    await generateAllSdkFixtures();
}

// Run the generation if this file is executed directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
    generateAllFixtures().catch(console.error);
}
