/**
 * A filepath to a Fern spec file, excluding the file extension
 */
export type FernFilepath = string & {
    __FernFilepath: void;
};

export const FernFilepath = {
    of: (value: string): FernFilepath => value as FernFilepath,
};
