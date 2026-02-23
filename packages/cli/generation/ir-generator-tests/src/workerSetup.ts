// Worker setup file — pre-imports heavy modules so they are cached in the worker's
// module cache when isolate is disabled. This avoids re-importing these modules
// for every generated test file, dramatically reducing per-file overhead.

// Heavy deps shared by runIRTestDefinition and runDynamicIRTestDefinition:
import "@fern-api/workspace-loader";
import "@fern-api/task-context";
import "@fern-api/fs-utils";
import "@fern-api/ir-generator";
import "@fern-api/ir-sdk";
import "@fern-api/cli-source-resolver";
import "@fern-api/configuration-loader";
