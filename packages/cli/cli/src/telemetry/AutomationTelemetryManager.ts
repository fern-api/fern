import type { PosthogAutomationEvent } from "@fern-api/task-context";
import { AutomationEventApiClient } from "./AutomationEventApiClient.js";
import { type AutomationTelemetryContext, getAutomationContextFromEnv } from "./automationTelemetryContext.js";
import { type AutomationTelemetryEvent, toPosthogProperties } from "./automationTelemetryEvent.js";

const FLUSH_TIMEOUT_MS = 3000;

export interface AutomationTelemetryReporter {
    instrumentPostHogAutomationEvent: (event: PosthogAutomationEvent) => void;
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

    public emit(event: AutomationTelemetryEvent): void {
        this.capturePostHogEvent({ event, context: this.context });
        this.captureAutomationEventApiEvent(event, this.context);
    }

    public async flush(): Promise<void> {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        try {
            await Promise.race([
                this.automationEventApiClient.shutdown(),
                new Promise<void>((resolve) => {
                    timeout = setTimeout(resolve, FLUSH_TIMEOUT_MS);
                })
            ]);
        } finally {
            clearTimeout(timeout);
        }
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

    private captureAutomationEventApiEvent(event: AutomationTelemetryEvent, context: AutomationTelemetryContext): void {
        this.automationEventApiClient.post(event, context);
    }
}
