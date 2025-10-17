import { FernGeneratorExec, FernGeneratorExecClient } from "@fern-fern/generator-exec-sdk";

import { AbstractGeneratorNotificationService } from "./AbstractGeneratorNotificationService";

export { FernGeneratorExec };

export class GeneratorNotificationService implements AbstractGeneratorNotificationService {
    private client: FernGeneratorExecClient | undefined;
    private taskId: FernGeneratorExec.TaskId | undefined;
    private buffer: FernGeneratorExec.GeneratorUpdate[] = [];

    constructor(environment: FernGeneratorExec.GeneratorEnvironment) {
        if (environment._type === "remote") {
            this.client = new FernGeneratorExecClient({
                environment: environment.coordinatorUrl ?? environment.coordinatorUrlV2
            });

            this.taskId = environment.id;
            // Every 2 seconds we flush the buffer
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            setInterval(async () => {
                if (this.buffer.length > 0) {
                    await this.flush();
                }
            }, 2000);
        } else {
            this.client = undefined;
        }
    }

    public bufferUpdate(update: FernGeneratorExec.GeneratorUpdate): void {
        if (!this.client) {
            return;
        }

        this.buffer.push(update);
    }

    public async sendUpdate(update: FernGeneratorExec.GeneratorUpdate): Promise<void> {
        if (!this.client) {
            return;
        }

        this.buffer.push(update);
        await this.flush();
    }

    private async flush(): Promise<void> {
        if (!this.client || !this.taskId) {
            return;
        }

        try {
            const numSent = this.buffer.length;
            await this.client.logging.sendUpdate(this.taskId, this.buffer);
            this.buffer = this.buffer.slice(numSent);
        } catch (e) {
            // biome-ignore lint/suspicious/noConsole: allow console
            console.warn("Encountered error when sending update", e);
        }
    }
}
