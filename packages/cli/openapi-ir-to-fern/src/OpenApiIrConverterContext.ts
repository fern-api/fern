import { Logger } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";

export class OpenApiIrConverterContext {
    public logger: Logger;
    public taskContext: TaskContext;

    constructor({ taskContext }: { taskContext: TaskContext }) {
        this.logger = taskContext.logger;
        this.taskContext = taskContext;
    }
}
