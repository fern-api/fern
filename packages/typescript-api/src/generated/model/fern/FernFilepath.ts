/**
 * A filepath to a Fern spec file, excluding the file extension
 */
export type FernFilepath = string & {
    __fern: void;
};

export const FernFilepath = {
    of: (value: unknown): FernFilepath => value as FernFilepath,
};
