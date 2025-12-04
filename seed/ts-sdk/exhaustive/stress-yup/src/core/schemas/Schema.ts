export type Schema<Raw, Parsed> = {
    parse: (raw: unknown) => Parsed;
    json: (parsed: Parsed) => Raw;
    parseOrThrow: (raw: unknown) => Parsed;
    jsonOrThrow: (parsed: Parsed) => Raw;
    optional: () => Schema<Raw | null | undefined, Parsed | undefined>;
};

export type ObjectSchema<Raw, Parsed> = Schema<Raw, Parsed> & {
    extend: <R2, P2>(extension: ObjectSchema<R2, P2>) => ObjectSchema<Raw & R2, Parsed & P2>;
    passthrough: () => ObjectSchema<Raw, Parsed>;
};
