import { services, model } from "@fern-fern/generator-logging-api-client";
import { TaskId } from "@fern-fern/generator-logging-api-client/model";
import { GeneratorConfig } from "@fern-fern/ir-model/generators";

export class GeneratorLoggingClientWrapper {
    private generatorLoggingClient: undefined | services.GeneratorLoggingService;
    private taskId: undefined | TaskId;

    constructor(generatorConfig: GeneratorConfig) {
        if (generatorConfig.environment._type === "remote") {
            this.generatorLoggingClient = new services.GeneratorLoggingService({
                origin: generatorConfig.environment.coordinatorUrl,
            });
            this.taskId = generatorConfig.environment.id;
        }
    }

    public sendUpdate(update: model.GeneratorUpdate): void {
        this.sendUpdates([update]);
    }

    public sendUpdates(updates: model.GeneratorUpdate[]): void {
        if (this.generatorLoggingClient !== undefined && this.taskId !== undefined) {
            this.generatorLoggingClient.sendUpdate({
                taskId: this.taskId,
                body: updates,
            });
        }
    }
}
