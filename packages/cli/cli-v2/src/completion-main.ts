/**
 * Standalone completion helper binary.
 *
 * This is intentionally a minimal entrypoint that only imports completion.ts
 * so it bundles to ~200KB instead of the full 29MB CLI. The shell completion
 * script calls this binary directly for content-aware flag completions
 * (--group, --api, --instance), making TAB fast.
 *
 * Protocol (argv):
 *   complete.cjs --group     → prints group names from fern.yml, one per line
 *   complete.cjs --api       → prints api names from fern.yml, one per line
 *   complete.cjs --instance  → prints docs instance URLs from fern.yml, one per line
 */
import { getCompletionValues } from "./completion.js";

const flag = process.argv[2];

if (flag !== "--group" && flag !== "--api" && flag !== "--instance") {
    process.exit(0);
}

getCompletionValues(process.cwd())
    .then((values) => {
        let results: string[];
        if (flag === "--group") {
            results = values.groups;
        } else if (flag === "--api") {
            results = values.apis;
        } else {
            results = values.instances;
        }
        if (results.length > 0) {
            process.stdout.write(results.join("\n") + "\n");
        }
        process.exit(0);
    })
    .catch(() => process.exit(0));
