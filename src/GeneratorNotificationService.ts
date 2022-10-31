import { FernGeneratorExec } from "@fern-fern/generator-exec-client";

export class GeneratorNotificationService {
    // implementation defined in constructor
    public sendUpdate: (update: FernGeneratorExec.GeneratorUpdate) => Promise<void>;

    constructor(generatorConfig: FernGeneratorExec.GeneratorConfig) {
        if (generatorConfig.environment.type === "remote") {
            console.log(
                `generatorConfig.environment.type is remote. Origin is ${generatorConfig.environment.coordinatorUrlV2}`
            );
            const generatorExecClient = new FernGeneratorExec.Client({
                _origin: generatorConfig.environment.coordinatorUrlV2,
            });
            const taskId = generatorConfig.environment.id;
            this.sendUpdate = async (update) => {
                await generatorExecClient.logging.sendUpdate({
                    taskId,
                    _body: [update],
                });
            };
        } else {
            // no-op
            console.log("generatorConfig.environment.type is local.");
            this.sendUpdate = () => Promise.resolve();
        }
    }
}
