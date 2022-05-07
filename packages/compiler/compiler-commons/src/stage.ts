export interface CompilerStage<A, R, F> {
    run: (args: A) => StageResult<R, F> | Promise<StageResult<R, F>>;
}

export type StageResult<R, F> = SuccessfulStageResult<R> | FailedStageResult<F>;

export interface SuccessfulStageResult<R> {
    didSucceed: true;
    result: R;
}

export type FailedStageResult<F> = F & {
    didSucceed: false;
};
