import { FernGeneratorExec, FernGeneratorExecClient } from "@fern-fern/generator-exec-sdk";

export class GeneratorNotificationService {
    // implementation defined in constructor
    public sendUpdate: (update: FernGeneratorExec.GeneratorUpdate) => Promise<void>;

    constructor(generatorConfig: FernGeneratorExec.GeneratorConfig) {
        // eslint-disable-next-line no-console
        console.log(`Generator config environment is ${generatorConfig.environment.type}`);
        if (generatorConfig.environment.type === "remote") {
            const generatorExecClient = new FernGeneratorExecClient({
                environment: generatorConfig.environment.coordinatorUrlV2
            });
            const taskId = generatorConfig.environment.id;
            this.sendUpdate = async (update) => {
                await generatorExecClient.logging.sendUpdate(taskId, [update]);
            };
        } else {
            // no-op
            this.sendUpdate = () => Promise.resolve();
        }
    }
}
