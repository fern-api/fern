import { FernGeneratorExec, FernGeneratorExecClient } from "@fern-fern/generator-exec-sdk";

export class GeneratorLoggingWrapper {
    private maybeSendUpdates = async (_updates: FernGeneratorExec.GeneratorUpdate[]) => {
        /* default to no-op */
    };

    constructor(generatorConfig: FernGeneratorExec.GeneratorConfig) {
        if (generatorConfig.environment.type === "remote") {
            // eslint-disable-next-line no-console
            console.log("generatorConfig.environment.coordinatorUrlV2", generatorConfig.environment.coordinatorUrlV2);
            const generatorLoggingClient = new FernGeneratorExecClient({
                environment: generatorConfig.environment.coordinatorUrlV2
            });
            const taskId = generatorConfig.environment.id;
            this.maybeSendUpdates = async (updates) => {
                await generatorLoggingClient.logging.sendUpdate(taskId, updates);
            };
        }
    }

    public async sendUpdate(update: FernGeneratorExec.GeneratorUpdate): Promise<void> {
        await this.sendUpdates([update]);
    }

    public async sendUpdates(updates: FernGeneratorExec.GeneratorUpdate[]): Promise<void> {
        await this.maybeSendUpdates(updates);
    }
}
