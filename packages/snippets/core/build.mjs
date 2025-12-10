import { buildDynamicSnippets, getDirname } from "@fern-api/configs/build-utils.mjs";
import packageJson from "./package.json" with { type: "json" };

const __dirname = getDirname(import.meta.url);

await buildDynamicSnippets(__dirname, packageJson, process.argv[2]);
