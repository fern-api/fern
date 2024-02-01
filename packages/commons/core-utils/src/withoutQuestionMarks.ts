export declare type WithoutQuestionMarks<T> = {
    [K in keyof Required<T>]: undefined extends T[K] ? T[K] | undefined : T[K];
};
