import { GeneratorUpdate } from "@fern-fern/generator-logging-api-client/model/generatorLogging";
import { GeneratorLoggingService } from "@fern-fern/generator-logging-api-client/services/generatorLogging";
import { FernTypescriptGeneratorConfig } from "@fern-typescript/commons";

export class GeneratorNotificationService {
    // implementation defined in constructor
    public sendUpdate: (update: GeneratorUpdate) => Promise<void>;

    constructor(generatorConfig: FernTypescriptGeneratorConfig) {
        if (generatorConfig.environment._type === "remote") {
            const generatorLoggingClient = new GeneratorLoggingService({
                origin: generatorConfig.environment.coordinatorUrl,
            });
            const taskId = generatorConfig.environment.id;
            this.sendUpdate = async (update) => {
                await generatorLoggingClient.sendUpdate({
                    taskId,
                    body: [update],
                });
            };
        } else {
            // no-op
            this.sendUpdate = () => Promise.resolve();
        }
    }
}
