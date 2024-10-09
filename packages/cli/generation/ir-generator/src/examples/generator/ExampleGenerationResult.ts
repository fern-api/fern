export type ExampleGenerationResult<T> = ExampleGenerationSuccess<T> | ExampleGenerationFailure;

export interface ExampleGenerationSuccess<T> {
    type: "success";
    jsonExample: unknown;
    example: T;
}

export interface ExampleGenerationFailure {
    type: "failure";
    message: string;
}
