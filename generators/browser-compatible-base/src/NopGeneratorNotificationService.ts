import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { AbstractGeneratorNotificationService } from "./AbstractGeneratorNotificationService";

export class NopGeneratorNotificationService extends AbstractGeneratorNotificationService {
    public bufferUpdate(_: FernGeneratorExec.GeneratorUpdate): void {
        // no-op
        return;
    }

    public sendUpdate(_: FernGeneratorExec.GeneratorUpdate): Promise<void> {
        // no-op
        return Promise.resolve();
    }
}
