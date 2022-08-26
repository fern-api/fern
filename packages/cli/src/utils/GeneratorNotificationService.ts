import { GeneratorUpdate } from "@fern-fern/generator-exec-client/model/logging";
import { GeneratorLoggingService } from "@fern-fern/generator-exec-client/services/logging";
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
