export type SidebarItemId = string & {
    __sidebarItem: void;
};

export const SidebarItemId = {
    of: (id: string): SidebarItemId => id as SidebarItemId,
};
