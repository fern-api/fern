import { execSync } from "child_process";
import { readdirSync } from "fs";
import { join } from "path";

function runPreCommitScripts(): void {
    const preCommitDir = join(__dirname, "pre-commit");

    try {
        // Get all TypeScript files in the pre-commit directory
        const files = readdirSync(preCommitDir)
            .filter((file) => file.endsWith(".ts"))
            .sort(); // Sort for consistent execution order

        if (files.length === 0) {
            console.log("ℹ️  No pre-commit scripts found in scripts/pre-commit/");
            return;
        }

        console.log(`🚀 Running ${files.length} pre-commit script(s)...\n`);

        let successCount = 0;
        let failureCount = 0;

        for (const file of files) {
            const scriptPath = join(preCommitDir, file);
            console.log(`📋 Running: ${file}`);

            try {
                execSync(`npx tsx ${scriptPath}`, {
                    stdio: "inherit",
                    cwd: process.cwd()
                });
                console.log(`✅ ${file} completed successfully\n`);
                successCount++;
            } catch (error) {
                console.log(`❌ ${file} failed\n`);
                failureCount++;
            }
        }

        console.log(`📊 Pre-commit summary:`);
        console.log(`   ✅ Successful: ${successCount}/${files.length}`);

        if (failureCount > 0) {
            console.error(`\n💥 Pre-commit failed with ${failureCount} error(s)`);
            process.exit(1);
        }

        console.log(`\n🎉 All pre-commit scripts passed successfully!`);
        process.exit(0);
    } catch (error) {
        console.error("Error running pre-commit scripts:", (error as Error).message);
        process.exit(1);
    }
}

runPreCommitScripts();
