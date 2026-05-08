export const CLI_TEMPLATE = `#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program
    .name("{{apiName}}")
    .description("CLI for the {{apiName}} API")
    .version("0.0.1");

program.parse();
`;
