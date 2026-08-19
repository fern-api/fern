import { ResolvedAutomationConfig } from "./GeneratorsConfiguration.js";
import { AutomationSchema } from "./schemas/index.js";

const DEFAULT_AUTOMATION_CONFIG: ResolvedAutomationConfig = {
    generate: true,
    upgrade: true,
    preview: true,
    verify: true
};

/**
 * Resolves automation configuration using the cascade:
 * generator → group → root → default (all true).
 *
 * Each level can partially override the one below it.
 * Only explicitly set (non-undefined) fields at a higher-priority level
 * override the value from a lower-priority level.
 */
export function resolveAutomationConfig({
    rootAutomation,
    groupAutomation,
    generatorAutomation
}: {
    rootAutomation: AutomationSchema | undefined;
    groupAutomation: AutomationSchema | undefined;
    generatorAutomation: AutomationSchema | undefined;
}): ResolvedAutomationConfig {
    return {
        generate:
            generatorAutomation?.generate ??
            groupAutomation?.generate ??
            rootAutomation?.generate ??
            DEFAULT_AUTOMATION_CONFIG.generate,
        upgrade:
            generatorAutomation?.upgrade ??
            groupAutomation?.upgrade ??
            rootAutomation?.upgrade ??
            DEFAULT_AUTOMATION_CONFIG.upgrade,
        preview:
            generatorAutomation?.preview ??
            groupAutomation?.preview ??
            rootAutomation?.preview ??
            DEFAULT_AUTOMATION_CONFIG.preview,
        verify:
            generatorAutomation?.verify ??
            groupAutomation?.verify ??
            rootAutomation?.verify ??
            DEFAULT_AUTOMATION_CONFIG.verify
    };
}
