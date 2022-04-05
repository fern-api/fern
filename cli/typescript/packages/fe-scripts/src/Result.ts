export const Result = {
    success: (): Result => ({
        isSuccess: true,
        accumulate: (other) => (other.isSuccess ? Result.success() : Result.failure()),
    }),
    failure: (): Result => ({ isSuccess: false, accumulate: Result.failure }),
};

export interface Result {
    isSuccess: boolean;
    accumulate: (other: Result) => Result;
}
