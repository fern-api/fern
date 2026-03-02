// Worker setup file — pre-imports heavy modules so they are cached in the worker's
// module cache when isolate is disabled. With 47 test files sharing ~8 workers,
// each worker handles ~6 files. Without this, each file re-imports these modules.
// With isolate:false, they are loaded once per worker and shared across all files.

import "@fern-api/configuration-loader";
import "@fern-api/fs-utils";
import "@fern-api/lazy-fern-workspace";
import "@fern-api/logger";
import "@fern-api/task-context";
