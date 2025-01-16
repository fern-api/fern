export function iterateOverNavItems(navItems: Array<unknown>, origin: string): Array<URL> {
    return navItems.flatMap((navItem) => recurseOverGroup(navItem, origin));
}

function recurseOverGroup(group: unknown, origin: string): Array<URL> {
    if (typeof group === "string") {
        return [new URL(group, origin)];
    }

    if (typeof group === "object" && group != null && "pages" in group && Array.isArray(group.pages)) {
        return group.pages.flatMap((pageOrGroup: string | unknown) => {
            if (typeof pageOrGroup === "string") {
                return new URL(pageOrGroup, origin);
            }
            return recurseOverGroup(pageOrGroup, origin);
        });
    }

    return [];
}
