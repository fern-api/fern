import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { camelToKebab } from "../naming.js";

/** Custom config block the fern-cli-generator reads (generators/cli/src/customConfig.ts). */
export interface CliCustomConfigSchema {
    /** Overrides the binary name. Mirrors FernCliCustomConfig.binaryName. */
    binaryName?: string;
}

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: CliCustomConfigSchema | undefined;

    constructor({
        ir,
        config
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
    }) {
        super({ ir, config });
        this.ir = ir;
        this.customConfig = config.customConfig != null ? (config.customConfig as CliCustomConfigSchema) : undefined;
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config
        });
    }

    /**
     * The binary name that leads every command (e.g. `twilio`). Mirrors
     * `deriveBinaryName` (generators/cli/src/identity.ts): prefer `customConfig.binaryName`, else
     * fall back to the workspace name (the dynamic-IR analogue of `apiDisplayName`). Kebab-cased so
     * `My CLI` → `my-cli`, matching the Rust generator's binary identity.
     */
    public getBinaryName(): string {
        const configured = this.customConfig?.binaryName?.trim();
        const source = configured != null && configured.length > 0 ? configured : this.config.workspaceName;
        return camelToKebab(source);
    }

    /**
     * The command path leading up to (and including) the leaf command, e.g.
     * `["twilio", "messages", "create"]`. The namespace/resource segments come from the endpoint's
     * `fernFilepath` (each part kebab-cased the way `camel_to_kebab` kebabs group names at
     * parser.rs:3310) and the leaf from the endpoint `declaration.name` (parser.rs:3055).
     */
    public getCommandPrefix(endpoint: FernIr.dynamic.Endpoint): string[] {
        const prefix = [this.getBinaryName()];
        for (const part of endpoint.declaration.fernFilepath.allParts) {
            prefix.push(camelToKebab(part.originalName));
        }
        prefix.push(camelToKebab(endpoint.declaration.name.originalName));
        return prefix;
    }
}
