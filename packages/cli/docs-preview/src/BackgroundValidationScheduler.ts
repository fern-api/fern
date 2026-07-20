export class BackgroundValidationScheduler<T> {
    private active = false;
    private scheduled = false;
    private pending: T | undefined;

    public constructor(private readonly run: (value: T) => Promise<void>) {}

    public schedule(value: T): void {
        this.pending = value;
        this.schedulePending();
    }

    private schedulePending(): void {
        if (this.active || this.scheduled || this.pending == null) {
            return;
        }
        this.scheduled = true;
        setImmediate(() => {
            this.scheduled = false;
            void this.runPending();
        });
    }

    private async runPending(): Promise<void> {
        const value = this.pending;
        if (value == null) {
            return;
        }
        this.pending = undefined;
        this.active = true;
        try {
            await this.run(value);
        } finally {
            this.active = false;
            this.schedulePending();
        }
    }
}
