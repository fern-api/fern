import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { camelToKebab, kebabCaseBinaryName, toKebabFlag } from "../naming.js";

/** Custom config block the fern-cli-generator reads (generators/cli/src/customConfig.ts). */
export interface CliCustomConfigSchema {
    /** Overrides the binary name. Mirrors FernCliCustomConfig.binaryName. */
    binaryName?: string;
    /** Nests every generated command one level under this group (`<binary> <rootGroup> …`). */
    rootGroup?: string;
    /** Renames the user-agent-suffix flag; when set the runtime reserves this name instead. */
    userAgentSuffixFlag?: string;
    /** Named-profiles feature; when enabled the runtime reserves the `--profile` flag. */
    profiles?: { enabled?: boolean };
    /**
     * Not user config: set by the Fern CLI when it builds the `cli` dynamic IR. Maps each namespaced
     * spec's top-level `fernFilepath` part (e.g. `accountsV1`) to its `generators.yml` `namespace:`
     * (`accounts/v1`), which the importer flattens but the runtime mounts verbatim via `spec_under`.
     */
    namespaces?: Record<string, string>;
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
     * The binary name that leads every command (e.g. `twilio`). Mirrors `deriveBinaryName`
     * (generators/cli/src/identity.ts): prefer `customConfig.binaryName`, else fall back to the
     * workspace name (the dynamic-IR analogue of `apiDisplayName`). Normalized with the CLI's own
     * `toKebabCase` (lowercase-first) so acronym/mixed-case names resolve to the real executable —
     * e.g. `MyCLI` → `mycli`, not `camelToKebab`'s `my-c-l-i`.
     */
    public getBinaryName(): string {
        const configured = this.customConfig?.binaryName?.trim();
        const source = configured != null && configured.length > 0 ? configured : this.config.workspaceName;
        return kebabCaseBinaryName(source);
    }

    /**
     * The command path leading up to (and including) the leaf command, e.g.
     * `["twilio", "messages", "create"]`. When `customConfig.rootGroup` is set the CLI nests every
     * command one level under it (`<binary> <rootGroup> …`), so it is inserted right after the binary.
     * The namespace/resource segments come from the endpoint's `fernFilepath` (see `getGroupPath`) and
     * the leaf from the endpoint `declaration.name` (parser.rs:3055).
     */
    public getCommandPrefix(endpoint: FernIr.dynamic.Endpoint): string[] {
        const prefix = [this.getBinaryName()];
        const rootGroup = this.customConfig?.rootGroup?.trim();
        if (rootGroup != null && rootGroup.length > 0) {
            prefix.push(camelToKebab(rootGroup));
        }
        prefix.push(...this.getGroupPath(endpoint.declaration.fernFilepath.allParts.map((part) => part.originalName)));
        prefix.push(camelToKebab(endpoint.declaration.name.originalName));
        return prefix;
    }

    /**
     * The group segments for an endpoint's `fernFilepath` parts. Without a `namespaces` entry each part
     * is kebab-cased like `camel_to_kebab` (parser.rs:3310). With one, the namespace is split on `/` into verbatim segments (`split_prefix`,
     * app.rs), and a first resource named like the namespace's last segment is hoisted into it, matching
     * the runtime's stutter elision (`merge_into_path`, app.rs).
     */
    private getGroupPath(parts: string[]): string[] {
        const [head, ...rest] = parts;
        const namespace = head != null ? this.customConfig?.namespaces?.[head] : undefined;
        if (namespace == null) {
            return parts.map(camelToKebab);
        }
        const namespacePath = namespace.split("/").filter((segment) => segment.length > 0);
        const resources = rest.map(camelToKebab);
        if (resources.length > 0 && resources[0] === namespacePath[namespacePath.length - 1]) {
            resources.shift();
        }
        return [...namespacePath, ...resources];
    }

    /**
     * Extra flag names the runtime reserves beyond the built-ins, from config-dependent features:
     * a renamed `userAgentSuffixFlag` and the `profile` flag when `profiles` is enabled. A parameter
     * resolving to one of these gets the runtime's `-param` suffix.
     */
    public getReservedFlagNames(): ReadonlySet<string> {
        const reserved = new Set<string>();
        const uaFlag = this.customConfig?.userAgentSuffixFlag?.trim();
        if (uaFlag != null && uaFlag.length > 0) {
            reserved.add(toKebabFlag(uaFlag));
        }
        if (this.customConfig?.profiles?.enabled === true) {
            reserved.add("profile");
        }
        return reserved;
    }
}
