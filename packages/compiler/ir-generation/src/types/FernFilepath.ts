export type FernFilepath = string & {
    __fern: void;
};

export const FernFilepath = {
    of: (value: unknown): FernFilepath => value as FernFilepath,
};
