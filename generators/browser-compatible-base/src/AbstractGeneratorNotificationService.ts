import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk"

export abstract class AbstractGeneratorNotificationService {
    public abstract bufferUpdate(update: FernGeneratorExec.GeneratorUpdate): void
    public abstract sendUpdate(update: FernGeneratorExec.GeneratorUpdate): Promise<void>
}
