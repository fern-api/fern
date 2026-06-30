/**
 * @fern-api/generator-migrations
 *
 * Unified migration package for all Fern generator configurations.
 *
 * This package contains migrations for all generators, organized by generator name.
 */

import type { MigrationModule } from "@fern-api/migrations-base";
import csharpSdkMigrations from "./generators/csharp/migrations/index.js";
import goSdkMigrations from "./generators/go/migrations/index.js";
import javaSdkMigrations from "./generators/java/migrations/index.js";
import javaModelMigrations from "./generators/java-model/migrations/index.js";
import phpSdkMigrations from "./generators/php/migrations/index.js";
import pythonSdkMigrations from "./generators/python/migrations/index.js";
import rubySdkMigrations from "./generators/ruby/migrations/index.js";
import rustSdkMigrations from "./generators/rust/migrations/index.js";
import swiftSdkMigrations from "./generators/swift/migrations/index.js";
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
    "fernenterprise/fern-csharp-sdk": csharpSdkMigrations,

    // Go SDK
    "fernenterprise/fern-go-sdk": goSdkMigrations,
    "fernenterprise/fern-go-model": goSdkMigrations,

    // Java Model - both model and spring generators share the same migrations
    "fernenterprise/fern-java-model": javaModelMigrations,
    "fernenterprise/fern-java-spring": javaModelMigrations,

    // Java SDK
    "fernenterprise/fern-java-sdk": javaSdkMigrations,

    // Python - SDK, FastAPI, and Pydantic all share the same migrations
    "fernenterprise/fern-python-sdk": pythonSdkMigrations,
    "fernenterprise/fern-fastapi-server": pythonSdkMigrations,
    "fernenterprise/fern-pydantic-model": pythonSdkMigrations,

    // PHP SDK
    "fernenterprise/fern-php-sdk": phpSdkMigrations,

    // Ruby SDK
    "fernenterprise/fern-ruby-sdk": rubySdkMigrations,

    // Rust SDK
    "fernenterprise/fern-rust-sdk": rustSdkMigrations,

    // Swift SDK
    "fernenterprise/fern-swift-sdk": swiftSdkMigrations,

    // TypeScript SDK - all variants share the same migrations
    "fernenterprise/fern-typescript": typescriptSdkMigrations,
    "fernenterprise/fern-typescript-sdk": typescriptSdkMigrations,
    "fernenterprise/fern-typescript-node-sdk": typescriptSdkMigrations,
    "fernenterprise/fern-typescript-browser-sdk": typescriptSdkMigrations
};
