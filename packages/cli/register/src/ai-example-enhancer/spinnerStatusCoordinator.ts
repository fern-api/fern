interface ApiProgress {
    apiName: string;
    completed: number;
    total: number;
    endpointsSample?: string; // Sample of endpoints being processed
}

export class SpinnerStatusCoordinator {
    private static instance: SpinnerStatusCoordinator | undefined;
    private currentApiId: string | undefined;
    private queue: string[] = [];
    private progress: Map<string, ApiProgress> = new Map();

    private constructor() {}

    public static getInstance(): SpinnerStatusCoordinator {
        if (!SpinnerStatusCoordinator.instance) {
            SpinnerStatusCoordinator.instance = new SpinnerStatusCoordinator();
        }
        return SpinnerStatusCoordinator.instance;
    }

    public create(apiName: string, total: number, endpointsSample?: string): string {
        const id = `${apiName}-${Date.now()}-${Math.random()}`;
        this.progress.set(id, { apiName, completed: 0, total, endpointsSample });
        this.queue.push(id);

        if (!this.currentApiId) {
            this.currentApiId = id;
            this.updateSpinnerStatus();
        }

        return id;
    }

    public update(id: string, completed: number): void {
        const apiProgress = this.progress.get(id);
        if (apiProgress) {
            apiProgress.completed = completed;

            if (id === this.currentApiId) {
                this.updateSpinnerStatus();
            }
        }
    }

    public finish(id: string): void {
        this.progress.delete(id);
        const queueIndex = this.queue.indexOf(id);
        if (queueIndex !== -1) {
            this.queue.splice(queueIndex, 1);
        }

        if (id === this.currentApiId) {
            if (this.queue.length > 0) {
                this.currentApiId = this.queue[0];
                this.updateSpinnerStatus();
            } else {
                this.currentApiId = undefined;
                delete process.env.FERN_SPINNER_STATUS;
            }
        }
    }

    private updateSpinnerStatus(): void {
        if (!this.currentApiId) {
            delete process.env.FERN_SPINNER_STATUS;
            return;
        }

        const apiProgress = this.progress.get(this.currentApiId);
        if (apiProgress) {
            let statusMessage = `auto-generating examples for endpoints - ${apiProgress.apiName}`;

            // Add endpoint information if available
            if (apiProgress.endpointsSample) {
                statusMessage += ` (${apiProgress.endpointsSample})`;
            }

            statusMessage += ` - ${apiProgress.completed}/${apiProgress.total}`;
            process.env.FERN_SPINNER_STATUS = statusMessage;
        }
    }
}
