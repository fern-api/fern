#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program.name("cli").description("Generated CLI").version("0.0.1");

program.parse();
