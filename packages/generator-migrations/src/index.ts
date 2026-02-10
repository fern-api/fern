/**
 * @fern-api/generator-migrations
 *
 * Unified migration package for all Fern generator configurations.
 *
 * This package contains migrations for all generators, organized by generator name.
 */

import type { MigrationModule } from "@fern-api/migrations-base";
import csharpSdkMigrations from "./generators/csharp/migrations/index.js";
import javaSdkMigrations from "./generators/java/migrations/index.js";
import javaModelMigrations from "./generators/java-model/migrations/index.js";
import pythonSdkMigrations from "./generators/python/migrations/index.js";
import typescriptSdkMigrations from "./generators/typescript/migrations/index.js";

/**
 * All generator migrations indexed by full generator name.
 *
 * When adding migrations for a new generator:
 * 1. Add migrations under src/generators/{language}/migrations/
 * 2. Import the migration module
 * 3. Add entries for all generator name variants
 */
export const migrations: Record<string, MigrationModule> = {
    // C# SDK
    "fernapi/fern-csharp-sdk": csharpSdkMigrations,

    // Java Model - both model and spring generators share the same migrations
    "fernapi/fern-java-model": javaModelMigrations,
    "fernapi/fern-java-spring": javaModelMigrations,

    // Java SDK
    "fernapi/fern-java-sdk": javaSdkMigrations,

    // Python - SDK, FastAPI, and Pydantic all share the same migrations
    "fernapi/fern-python-sdk": pythonSdkMigrations,
    "fernapi/fern-fastapi-server": pythonSdkMigrations,
    "fernapi/fern-pydantic-model": pythonSdkMigrations,

    // TypeScript SDK - all variants share the same migrations
    "fernapi/fern-typescript": typescriptSdkMigrations,
    "fernapi/fern-typescript-sdk": typescriptSdkMigrations,
    "fernapi/fern-typescript-node-sdk": typescriptSdkMigrations,
    "fernapi/fern-typescript-browser-sdk": typescriptSdkMigrations
};
