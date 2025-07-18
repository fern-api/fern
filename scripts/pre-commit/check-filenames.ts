import { execSync } from "child_process";

// biome-ignore lint/suspicious/noControlCharactersInRegex: control characters are needed to detect invalid filenames
const [invalidChars, reservedNames] = [/[<>:"|?*\x00-\x1F]/, /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i];

function checkFilenames(): void {
    try {
        const output = execSync("git diff --cached --name-only", { encoding: "utf8" });
        const files = output.split("\n").filter(Boolean);

        const invalidFiles = files.filter((file: string) => {
            const filename = file.split("/").pop();
            return invalidChars.test(file) || (filename && reservedNames.test(filename));
        });

        if (invalidFiles.length > 0) {
            process.stderr.write("❌ Invalid filenames found:");
            invalidFiles.forEach((file: string) => {
                process.stderr.write(`  - ${file}`);
            });
            process.stderr.write('\nFilenames cannot contain: < > : " | ? * or control characters');
            process.stderr.write("Reserved names: CON, PRN, AUX, NUL, COM1-9, LPT1-9");
            process.exit(1);
        }

        process.stdout.write("✅ All filenames are valid for cross-platform compatibility");
    } catch (error) {
        process.stderr.write(`Error checking filenames: ${(error as Error).message}`);
        process.exit(1);
    }
}

checkFilenames();
