import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";

/**
 * Whether to attach local variable values to each stack frame on exceptions
 * captured by Sentry.
 *
 * Only enabled for remote (Fiddle-orchestrated) executions, which run in an
 * isolated container where stack-frame locals can't contain user-machine
 * secrets. Local runs — where the generator executes on a customer's machine
 * via docker — are excluded to avoid serializing tokens, env vars, or
 * customer spec contents into Sentry events.
 */
export function shouldTrackLocalVariablesInSentry(config: FernGeneratorExec.GeneratorConfig): boolean {
    switch (config.environment.type) {
        case "local":
            return false;
        case "remote":
            return true;
    }
}
