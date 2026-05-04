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
            process.stdout.write("ℹ️  No pre-commit scripts found in scripts/pre-commit/");
            return;
        }

        process.stdout.write(`🚀 Running ${files.length} pre-commit script(s)...\n`);

        let successCount = 0;
        let failureCount = 0;

        for (const file of files) {
            const scriptPath = join(preCommitDir, file);
            process.stdout.write(`📋 Running: ${file}`);

            try {
                execSync(`pnpm tsx ${scriptPath}`, {
                    stdio: "inherit",
                    cwd: process.cwd()
                });
                process.stdout.write(`✅ ${file} completed successfully\n`);
                successCount++;
            } catch (error) {
                process.stdout.write(`❌ ${file} failed\n`);
                failureCount++;
            }
        }

        process.stdout.write(`📊 Pre-commit summary:`);
        process.stdout.write(`   ✅ Successful: ${successCount}/${files.length}`);

        if (failureCount > 0) {
            process.stderr.write(`\n💥 Pre-commit failed with ${failureCount} error(s)`);
            process.exit(1);
        }

        process.stdout.write(`\n🎉 All pre-commit scripts passed successfully!`);
        process.exit(0);
    } catch (error) {
        process.stderr.write(`Error running pre-commit scripts: ${(error as Error).message}`);
        process.exit(1);
    }
}

runPreCommitScripts();
