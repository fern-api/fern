import { askToLogin } from "@fern-api/login";

import { CliContext } from "../cli-context/CliContext.js";

/** The token of the user's Fern login (or FERN_TOKEN), signing in first when the terminal allows it. */
export async function requireFernLogin(cliContext: CliContext): Promise<string> {
    const token = await cliContext.runTask((context) => askToLogin(context));
    return token.value;
}
