export type SidebarItemId = string & {
    __sidebarItem: void;
};

export interface StaticSidebarItemIdParser<ID extends string, Parsed> {
    type: "static";
    id: ID;
    parsed: Parsed;
}

export interface DynamicSidebarItemIdParser<ConstructArg, Parsed> {
    type: "dynamic";
    construct: (arg: ConstructArg) => SidebarItemId;
    parse: (sidebarItemId: SidebarItemId) => Parsed | undefined;
}
