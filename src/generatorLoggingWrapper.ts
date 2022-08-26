import { GeneratorConfig } from "@fern-fern/generator-exec-client/model/config";
import { GeneratorUpdate } from "@fern-fern/generator-exec-client/model/logging";
import { GeneratorLoggingService } from "@fern-fern/generator-exec-client/services/logging";

export class GeneratorLoggingWrapper {
    private maybeSendUpdates = async (_updates: GeneratorUpdate[]) => {
        /* default to no-op */
    };

    constructor(generatorConfig: GeneratorConfig) {
        if (generatorConfig.environment._type === "remote") {
            const generatorLoggingClient = new GeneratorLoggingService({
                origin: generatorConfig.environment.coordinatorUrl,
            });
            const taskId = generatorConfig.environment.id;
            this.maybeSendUpdates = async (updates) => {
                await generatorLoggingClient.sendUpdate({
                    taskId,
                    body: updates,
                });
            };
        }
    }

    public async sendUpdate(update: GeneratorUpdate): Promise<void> {
        await this.sendUpdates([update]);
    }

    public async sendUpdates(updates: GeneratorUpdate[]): Promise<void> {
        await this.maybeSendUpdates(updates);
    }
}
