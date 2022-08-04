import { GeneratorUpdate } from "@fern-fern/generator-logging-api-client/model";
import { GeneratorLoggingService } from "@fern-fern/generator-logging-api-client/services";
import { FernTypescriptGeneratorConfig } from "@fern-typescript/commons";

export class GeneratorNotificationService {
    constructor(generatorConfig: FernTypescriptGeneratorConfig) {
        if (generatorConfig.environment._type === "remote") {
            const generatorLoggingClient = new GeneratorLoggingService({
                origin: generatorConfig.environment.coordinatorUrl,
            });
            const taskId = generatorConfig.environment.id;
            this.sendUpdates = async (updates) => {
                await generatorLoggingClient.sendUpdate({
                    taskId,
                    body: updates,
                });
            };
        } else {
            this.sendUpdates = async () => {
                /* no-op */
            };
        }
    }

    public async sendUpdate(update: GeneratorUpdate): Promise<void> {
        await this.sendUpdates([update]);
    }

    // defined in constructor
    public sendUpdates: (updates: GeneratorUpdate[]) => Promise<void>;
}
