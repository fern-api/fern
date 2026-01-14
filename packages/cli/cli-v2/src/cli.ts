import { Command } from "commander";
import { createAuthCommand } from "./commands/auth";

export const program = new Command()
    .name("fern-v2")
    .description("Fern CLI v2")
    .version("0.0.1")
    .option("-v, --verbose", "Enable verbose logging", false)
    .option("--log-level <level>", "Set log level", "info");

program.addCommand(createAuthCommand());

export async function runCliV2(argv?: string[]): Promise<void> {
    if (argv) {
        await program.parseAsync(argv, { from: "user" });
        return;
    }
    await program.parseAsync(process.argv);
}
