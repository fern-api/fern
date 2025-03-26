import { Access } from "../Access";

interface Accessible {
    access: Access;
}

export function orderByAccess<T extends Accessible>(items: T[]): T[] {
    return _orderByAccess(items, [Access.Public, Access.PublicReadonly, Access.Protected, Access.Private]);
}

function _orderByAccess<T extends Accessible>(items: T[], order: Access[]): T[] {
    return order.reduce<T[]>((result, access) => [...result, ...items.filter((item) => item.access === access)], []);
}
