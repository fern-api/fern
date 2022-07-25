import execa, { Options } from "execa";
import path from "path";

export async function runFernCli(args: string[], options?: Options): Promise<execa.ExecaChildProcess> {
    const cmd = execa("node", [path.join(__dirname, "../../../../cli/webpack/dist/bundle.js"), ...args], options);
    cmd.stdout?.pipe(process.stdout);
    cmd.stderr?.pipe(process.stderr);
    return cmd;
}
