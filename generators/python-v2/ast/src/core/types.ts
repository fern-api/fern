export type ModulePath = string[] | Readonly<string[]>;

export type AttrPath = string[] | Readonly<string[]>;

export interface ImportedName {
    name: string;
    isAlias?: boolean;
}
