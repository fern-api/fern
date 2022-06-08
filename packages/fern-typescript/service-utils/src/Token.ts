export type Token = string | undefined | (() => Promise<string | undefined>);
