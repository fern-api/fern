// Worker setup file — pre-imports heavy modules so they are cached in the worker's
// module cache when isolate is disabled. With 56 test files sharing ~8 workers,
// each worker handles ~7 files. Without this, each file re-imports these modules.
// With isolate:false, they are loaded once per worker and shared across all files.

import "@fern-api/cli-source-resolver";
import "@fern-api/fs-utils";
import "@fern-api/ir-generator";
import "@fern-api/ir-sdk";
import "@fern-api/task-context";
import "@fern-api/workspace-loader";
