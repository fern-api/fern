export class Task {
    private _didSucceed = true;

    public run(runner: Promise<void>): void;
    public run(runner: () => void): void;
    public run(runner: () => Promise<void>): Promise<void>;
    public run(runner: Promise<void> | (() => MaybePromise<void>)): MaybePromise<void> {
        if (typeof runner !== "function") {
            return runner.catch(() => this.handleError());
        }

        try {
            const result = runner();
            if (isPromise(result)) {
                return result.catch(() => this.handleError());
            }
        } catch (e) {
            this.handleError();
        }
    }

    get didSucceed(): boolean {
        return this._didSucceed;
    }

    private handleError(): void {
        this._didSucceed = false;
    }
}

type MaybePromise<T> = T | Promise<T>;

function isPromise<T>(maybePromise: MaybePromise<T>): maybePromise is Promise<T> {
    return typeof (maybePromise as Promise<T>)?.then === "function";
}

export type TaskResult<R> = SuccessfulTask<R> | FailedTask;

export interface SuccessfulTask<R> {
    isSuccess: true;
    result: R;
}

export interface FailedTask {
    isSuccess: false;
    errors: TaskError[];
}

export interface TaskError {
    title: string;
    additionalInfo?: string;
}
