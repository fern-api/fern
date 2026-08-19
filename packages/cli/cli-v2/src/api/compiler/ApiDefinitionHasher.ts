import { AbsoluteFilePath } from "@fern-api/fs-utils";
import crypto from "crypto";
import fs from "fs/promises";

import type { ApiDefinition } from "../config/ApiDefinition.js";
import type { ApiSpec } from "../config/ApiSpec.js";
import { isAsyncApiSpec } from "../config/AsyncApiSpec.js";
import { isConjureSpec } from "../config/ConjureSpec.js";
import { isFernSpec } from "../config/FernSpec.js";
import { isGraphQlSpec } from "../config/GraphQlSpec.js";
import { isOpenApiSpec } from "../config/OpenApiSpec.js";
import { isOpenRpcSpec } from "../config/OpenRpcSpec.js";
import { isProtobufSpec } from "../config/ProtobufSpec.js";

/**
 * Computes a SHA-256 hash of an API definition's input files and configuration.
 *
 * The hash captures everything that could influence the generated IR:
 *  - The full ApiDefinition structure (all fields on all specs, serialized as JSON)
 *  - Contents of all referenced spec files (sorted by path for determinism)
 */
export class ApiDefinitionHasher {
    /**
     * Compute a SHA-256 hash for an API definition and compilation options.
     *
     * @param options - Compilation options that influence IR output (language, audiences, etc.).
     *                  These are included in the hash so different option combinations produce
     *                  different cache keys.
     */
    public async hash(definition: ApiDefinition, options?: Record<string, unknown>): Promise<string> {
        const hasher = crypto.createHash("sha256");

        // Hash the entire definition structure. This captures all configuration
        // fields (auth, settings, namespace, etc.) and file paths. Any future
        // field additions are automatically included.
        hasher.update(JSON.stringify(definition));

        // Hash compilation options that affect IR output.
        if (options != null) {
            hasher.update(JSON.stringify(options));
        }

        // Hash file contents separately — the definition contains paths but not
        // file contents, so we need to read them to detect content changes.
        const filePaths = this.collectFilePaths(definition);
        filePaths.sort();

        for (const filePath of filePaths) {
            try {
                const content = await fs.readFile(filePath, "utf-8");
                hasher.update(content);
            } catch {
                // If a file can't be read, include a sentinel so missing files
                // still produce a distinct hash.
                hasher.update(`__missing__:${filePath}`);
            }
        }

        return hasher.digest("hex");
    }

    private collectFilePaths(definition: ApiDefinition): string[] {
        const paths: string[] = [];
        for (const spec of definition.specs) {
            this.collectSpecFilePaths(spec, paths);
        }
        return paths;
    }

    private collectSpecFilePaths(spec: ApiSpec, paths: string[]): void {
        if (isFernSpec(spec)) {
            paths.push(spec.fern);
            return;
        }
        if (isOpenApiSpec(spec)) {
            paths.push(spec.openapi);
            this.pushOverrides(spec.overrides, paths);
            if (spec.overlays != null) {
                paths.push(spec.overlays);
            }
            return;
        }
        if (isAsyncApiSpec(spec)) {
            paths.push(spec.asyncapi);
            this.pushOverrides(spec.overrides, paths);
            return;
        }
        if (isProtobufSpec(spec)) {
            paths.push(spec.proto.root);
            if (spec.proto.target != null) {
                paths.push(spec.proto.target);
            }
            this.pushOverrides(spec.proto.overrides, paths);
            return;
        }
        if (isOpenRpcSpec(spec)) {
            paths.push(spec.openrpc);
            this.pushOverrides(spec.overrides, paths);
            return;
        }
        if (isGraphQlSpec(spec)) {
            paths.push(spec.graphql);
            this.pushOverrides(spec.overrides, paths);
            return;
        }
        if (isConjureSpec(spec)) {
            paths.push(spec.conjure);
        }
    }

    private pushOverrides(overrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined, paths: string[]): void {
        if (overrides == null) {
            return;
        }
        if (Array.isArray(overrides)) {
            paths.push(...overrides);
            return;
        }
        paths.push(overrides);
    }
}
