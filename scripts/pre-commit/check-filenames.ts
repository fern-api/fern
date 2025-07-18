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
            const errorMessage = [
                "❌ Invalid filenames found:",
                ...invalidFiles.map((file: string) => `  - ${file}`),
                "",
                // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional
                "Filenames cannot contain: < > : \" | ? * or control characters",
                // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional
                "Reserved names: CON, PRN, AUX, NUL, COM1-9, LPT1-9"
            ].join("\n");
            
            process.stderr.write(errorMessage + "\n");
            throw new Error("Invalid filenames detected");
        }

        process.stdout.write("✅ All filenames are valid for cross-platform compatibility\n");
    } catch (error) {
        if (error instanceof Error && error.message === "Invalid filenames detected") {
            // Re-throw our custom error
            throw error;
        }
        // Handle other errors (like git command failures)
        process.stderr.write(`Error checking filenames: ${(error as Error).message}\n`);
        throw new Error(`Filename check failed: ${(error as Error).message}`);
    }
}

checkFilenames();
