export interface ExamplePropertyMetadata {
    hasDefaultProperties: boolean;
    hasCustomProperties: boolean;
}

export type ExampleGenerationResult<T> = ExampleGenerationSuccess<T> | ExampleGenerationFailure;

export interface ExampleGenerationSuccess<T> {
    type: "success";
    jsonExample: unknown;
    example: T;
    metadata?: ExamplePropertyMetadata;
}

export interface ExampleGenerationFailure {
    type: "failure";
    message: string;
}
