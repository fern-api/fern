import { FernGeneratorExec, FernGeneratorExecClient } from "@fern-fern/generator-exec-sdk";

export interface GeneratorNotificationService {
    sendUpdateOrThrow: (update: FernGeneratorExec.GeneratorUpdate) => Promise<void>;
    sendUpdateAndSwallowError: (update: FernGeneratorExec.GeneratorUpdate) => Promise<void>;
}

export class GeneratorNotificationServiceImpl implements GeneratorNotificationService {
    private client: FernGeneratorExecClient;
    private taskId: FernGeneratorExec.TaskId;

    constructor(environment: FernGeneratorExec.RemoteGeneratorEnvironment) {
        this.client = new FernGeneratorExecClient({
            environment: environment.coordinatorUrlV2
        });
        this.taskId = environment.id;
    }

    public async sendUpdateAndSwallowError(update: FernGeneratorExec.GeneratorUpdate): Promise<void> {
        try {
            await this.sendUpdateOrThrow(update);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Encountered error when sending update", e);
        }
    }

    public sendUpdateOrThrow(update: FernGeneratorExec.GeneratorUpdate): Promise<void> {
        return this.client.logging.sendUpdate(this.taskId, [update]);
    }
}
