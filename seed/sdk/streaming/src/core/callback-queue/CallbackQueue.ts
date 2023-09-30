export class CallbackQueue {
    private queue = Promise.resolve();

    public wrap<Args extends any[]>(callback: (...args: Args) => void | Promise<void>): (...args: Args) => void;
    public wrap(callback: undefined): undefined;
    public wrap<Args extends any[]>(
        callback: ((...args: Args) => void | Promise<void>) | undefined
    ): ((...args: Args) => void) | undefined {
        if (callback == null) {
            return undefined;
        }
        return (...args: Args) => {
            this.queue = this.queue.then(() => {
                return callback(...args);
            });
        };
    }

    public toPromise(): Promise<void> {
        return this.queue;
    }
}
