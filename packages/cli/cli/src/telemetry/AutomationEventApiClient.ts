/**
 * POSTs automation events to the automation event API at
 * `/v1/automation/events` - the failure path that feeds Slack delivery.
 *
 * Best-effort by design: failures here are swallowed so the parallel
 * Sentry and PostHog writes still surface the incident.
 */
import { getAccessToken } from "@fern-api/auth";
import type { AutomationTelemetryContext } from "./automationTelemetryContext.js";
import type { AutomationTelemetryEvent } from "./automationTelemetryEvent.js";
import { toAutomationEventApiBody } from "./automationTelemetryEvent.js";

/**
 * Origin override. Keep the default empty until the automation event API origin
 * is ready to receive CLI automation events in production.
 */
const DEFAULT_AUTOMATION_EVENTS_ORIGIN = "";
const AUTOMATION_EVENTS_ORIGIN_ENV_VAR = "FERN_AUTOMATION_EVENTS_ORIGIN";

/**
 * How long to wait for the automation event API before giving up. The CLI's
 * exit path cannot afford to hang on a slow Slack dispatcher, so we cap
 * aggressively.
 */
const POST_TIMEOUT_MS = 3000;

export class AutomationEventApiClient {
    private static instance: AutomationEventApiClient | undefined;

    private readonly origin: string;
    private inflight: Promise<unknown>[] = [];

    public static getInstance(): AutomationEventApiClient {
        if (AutomationEventApiClient.instance == null) {
            AutomationEventApiClient.instance = new AutomationEventApiClient(
                process.env[AUTOMATION_EVENTS_ORIGIN_ENV_VAR] ?? DEFAULT_AUTOMATION_EVENTS_ORIGIN
            );
        }
        return AutomationEventApiClient.instance;
    }

    private constructor(origin: string) {
        this.origin = origin;
    }

    /**
     * Resolves the automation event API endpoint from the baked origin.
     * Returns undefined when no origin is configured - callers silently skip
     * the POST in that case.
     */
    public resolveEndpoint(): string | undefined {
        if (this.origin.length === 0) {
            return undefined;
        }
        return `${this.origin.replace(/\/$/, "")}/v1/automation/events`;
    }

    /**
     * Enqueues an automation event POST to the automation event API.
     *
     * Best-effort: on any failure (timeout, DNS, non-2xx, missing endpoint),
     * the request settles without throwing. Sentry + PostHog already captured
     * the incident.
     */
    public post(event: AutomationTelemetryEvent, context: AutomationTelemetryContext): void {
        this.inflight.push(this.send(event, context));
    }

    public async shutdown(): Promise<void> {
        const pending = this.inflight;
        this.inflight = [];
        if (pending.length > 0) {
            await Promise.allSettled(pending);
        }
    }

    private async send(event: AutomationTelemetryEvent, context: AutomationTelemetryContext): Promise<void> {
        const endpoint = this.resolveEndpoint();
        if (endpoint == null) {
            return;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), POST_TIMEOUT_MS);
        try {
            const headers: Record<string, string> = { "content-type": "application/json" };
            const token = await getAccessToken();
            if (token != null && token.value.length > 0) {
                headers.Authorization = `Bearer ${token.value}`;
            }
            const response = await fetch(endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify(toAutomationEventApiBody(event, context)),
                signal: controller.signal
            });
            void response;
        } catch {
            return;
        } finally {
            clearTimeout(timer);
        }
    }
}
