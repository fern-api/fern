import { CliContext } from "../../cli-context/CliContext";

export async function upgradeGenerator({
    cliContext,
    generator,
    targetVersion
}: {
    cliContext: CliContext;
    generator: string | undefined;
    targetVersion: string | undefined;
}): Promise<void> {}
