#!/usr/bin/env node

/**
 * Validation script to ensure the CLI package.json has no production dependencies.
 * All dependencies should be devDependencies to avoid bundling issues.
 */

const fs = require('fs');
const path = require('path');

const CLI_PACKAGE_JSON_PATH = path.join(__dirname, '../packages/cli/cli/package.json');

function main() {
    try {
        // Read the CLI package.json
        const packageJsonContent = fs.readFileSync(CLI_PACKAGE_JSON_PATH, 'utf8');
        const packageJson = JSON.parse(packageJsonContent);

        // Check if there are any production dependencies
        const dependencies = packageJson.dependencies;

        if (dependencies && Object.keys(dependencies).length > 0) {
            console.error('❌ ERROR: CLI package.json contains production dependencies!');
            console.error('All dependencies should be devDependencies to avoid bundling issues.');
            console.error('\nFound production dependencies:');

            for (const [name, version] of Object.entries(dependencies)) {
                console.error(`  - ${name}: ${version}`);
            }

            console.error('\nPlease move these to devDependencies instead.');
            process.exit(1);
        }

        // Success case
        console.log('✅ CLI package.json validation passed: No production dependencies found.');

        // Optional: Show summary of devDependencies for transparency
        const devDependencies = packageJson.devDependencies;
        if (devDependencies) {
            const devDepCount = Object.keys(devDependencies).length;
            console.log(`   Found ${devDepCount} devDependencies (as expected).`);
        }

    } catch (error) {
        console.error('❌ ERROR: Failed to validate CLI dependencies:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };