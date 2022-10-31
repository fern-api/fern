import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import { GeneratorConfig, GeneratorUpdate } from "@fern-fern/generator-exec-client/api";

export class GeneratorLoggingWrapper {
    private maybeSendUpdates = async (_updates: GeneratorUpdate[]) => {
        /* default to no-op */
    };

    constructor(generatorConfig: GeneratorConfig) {
        if (generatorConfig.environment.type === "remote") {
            const generatorLoggingClient = new FernGeneratorExec.Client({
                _origin: generatorConfig.environment.coordinatorUrlV2,
            });
            const taskId = generatorConfig.environment.id;
            this.maybeSendUpdates = async (updates) => {
                const sendUpdateResponse = await generatorLoggingClient.logging.sendUpdate({
                    taskId,
                    _body: updates,
                });
                if (!sendUpdateResponse.ok) {
                    console.log(`Failed to send update to generator.
                        ${JSON.stringify(sendUpdateResponse.error)}`);
                }
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
