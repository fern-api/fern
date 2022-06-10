export type Token = string | undefined | (() => string | undefined | Promise<string | undefined>);
