export type FernEnumConfig = Record<
    string,
    {
        description?: string;
        name?: string;
        casing?: {
            snake?: string;
            camel?: string;
            screamingSnake?: string;
            pascal?: string;
        };
    }
>;
