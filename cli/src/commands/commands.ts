import { Command, CommandKey } from "./Command";
import { clientCommand } from "./impls/clientCommand";
import { modelCommand } from "./impls/modelCommand";
import { serverCommand } from "./impls/serverCommand";

export const COMMANDS: { [K in typeof CommandKey[keyof typeof CommandKey]]: Command<K> } = {
    server: serverCommand,
    client: clientCommand,
    model: modelCommand,
};
