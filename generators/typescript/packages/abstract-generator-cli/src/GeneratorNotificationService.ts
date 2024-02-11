import { FernGeneratorExec, FernGeneratorExecClient } from "@fern-fern/generator-exec-sdk";

export interface GeneratorNotificationService {
    bufferUpdate: (update: FernGeneratorExec.GeneratorUpdate) => void;
    sendUpdate: (update: FernGeneratorExec.GeneratorUpdate) => Promise<void>;
}

export class GeneratorNotificationServiceImpl implements GeneratorNotificationService {
    private client: FernGeneratorExecClient;
    private taskId: FernGeneratorExec.TaskId;
    private buffer: FernGeneratorExec.GeneratorUpdate[] = [];

    constructor(environment: FernGeneratorExec.RemoteGeneratorEnvironment) {
        this.client = new FernGeneratorExecClient({
            environment: environment.coordinatorUrlV2,
        });
        this.taskId = environment.id;
        // Every 2 seconds we flush the buffer
        setInterval(async () => {
            if (this.buffer.length > 0) {
                await this.flush();
            }
        }, 2000);
    }

    public bufferUpdate(update: FernGeneratorExec.GeneratorUpdate): void {
        this.buffer.push(update);
    }

    public async sendUpdate(update: FernGeneratorExec.GeneratorUpdate): Promise<void> {
        this.buffer.push(update);
        await this.flush();
    }

    private async flush(): Promise<void> {
        try {
            const numSent = this.buffer.length;
            await this.client.logging.sendUpdate(this.taskId, this.buffer);
            this.buffer = this.buffer.slice(numSent);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Encountered error when sending update", e);
        }
    }
}
