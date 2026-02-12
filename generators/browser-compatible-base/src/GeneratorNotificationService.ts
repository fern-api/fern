import {
    FernGeneratorExec,
    FernGeneratorExecClient,
    serialization as GeneratorExecParsing
} from "@fern-fern/generator-exec-sdk";

type ExitStatusUpdate = FernGeneratorExec.ExitStatusUpdate;
const ExitStatusUpdate = FernGeneratorExec.ExitStatusUpdate;
type GeneratorUpdate = FernGeneratorExec.GeneratorUpdate;
const GeneratorUpdate = FernGeneratorExec.GeneratorUpdate;
type GeneratorConfig = FernGeneratorExec.GeneratorConfig;
type GithubOutputMode = FernGeneratorExec.GithubOutputMode;
type LogLevel = FernGeneratorExec.LogLevel;

import { AbstractGeneratorNotificationService } from "./AbstractGeneratorNotificationService.js";

export { GeneratorExecParsing, ExitStatusUpdate, GeneratorUpdate, type LogLevel, FernGeneratorExec };
export type { GeneratorConfig, GithubOutputMode };

export class GeneratorNotificationService implements AbstractGeneratorNotificationService {
    private client: FernGeneratorExecClient | undefined;
    private taskId: FernGeneratorExec.TaskId | undefined;
    private buffer: FernGeneratorExec.GeneratorUpdate[] = [];

    constructor(environment: FernGeneratorExec.GeneratorEnvironment) {
        if (environment.type === "remote") {
            this.client = new FernGeneratorExecClient({
                environment: environment.coordinatorUrlV2
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
