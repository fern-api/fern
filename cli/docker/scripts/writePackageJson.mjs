#!/usr/bin/env node

import { writeFile } from "fs/promises";
import path from "path";

const MONOREPO_DIRECTORY = "/fern";

await writeFile(
    path.join(MONOREPO_DIRECTORY, "package.json"),
    JSON.stringify({
        name: "fern",
        private: true,
        workspaces: ["packages/**"],
        packageManager: "yarn@3.2.0",
    })
);
