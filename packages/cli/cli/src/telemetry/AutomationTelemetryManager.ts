import type { CaptureExceptionOptions, PosthogAutomationEvent } from "@fern-api/task-context";
import { AutomationEventApiClient } from "./AutomationEventApiClient.js";
import { type AutomationTelemetryContext, getAutomationContextFromEnv } from "./automationTelemetryContext.js";
import {
    type AutomationTelemetryEvent,
    isFailureAutomationEventName,
    toPosthogProperties,
    toSentryContext,
    toSentryTags
} from "./automationTelemetryEvent.js";

export interface AutomationTelemetryReporter {
    instrumentPostHogAutomationEvent: (event: PosthogAutomationEvent) => void;
    captureException: (error: unknown, options?: CaptureExceptionOptions) => string | undefined;
}

export interface AutomationTelemetryEmitOptions {
    error?: unknown;
}

export class AutomationTelemetryManager {
    private context: AutomationTelemetryContext;

    public constructor(
        private readonly reporter: AutomationTelemetryReporter,
        private readonly automationEventApiClient: AutomationEventApiClient = AutomationEventApiClient.getInstance()
    ) {
        this.context = getAutomationContextFromEnv();
    }

    public setOrganization(organization: string): void {
        this.context = { ...this.context, org: organization };
    }

    public emit(event: AutomationTelemetryEvent, options?: AutomationTelemetryEmitOptions): void {
        const sentryEventId = this.captureSentryForFailure({
            event,
            context: this.context,
            error: options?.error
        });

        const eventWithSentry =
            sentryEventId == null
                ? event
                : { ...event, attributes: { ...(event.attributes ?? {}), sentry_event_id: sentryEventId } };
        this.capturePostHogEvent({ event: eventWithSentry, context: this.context });
        this.captureAutomationEventApiEvent(eventWithSentry, this.context);
    }

    public async flush(): Promise<void> {
        await this.automationEventApiClient.shutdown();
    }

    private capturePostHogEvent({
        event,
        context
    }: {
        event: AutomationTelemetryEvent;
        context: AutomationTelemetryContext;
    }): void {
        this.reporter.instrumentPostHogAutomationEvent({
            distinctId: context.run_id ?? undefined,
            event: event.event,
            properties: toPosthogProperties(event, context)
        });
    }

    private captureSentryForFailure({
        event,
        context,
        error
    }: {
        event: AutomationTelemetryEvent;
        context: AutomationTelemetryContext;
        error?: unknown;
    }): string | undefined {
        if (!isFailureAutomationEventName(event.event) || event.errorCode == null) {
            return undefined;
        }
        if (event.attributes?.failure_source === "fiddle") {
            return undefined;
        }
        return this.reporter.captureException(error, {
            tags: toSentryTags(event, context),
            context: {
                automation: toSentryContext(event, context)
            }
        });
    }

    private captureAutomationEventApiEvent(event: AutomationTelemetryEvent, context: AutomationTelemetryContext): void {
        this.automationEventApiClient.post(event, context);
    }
}
