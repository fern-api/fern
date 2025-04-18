export function keys<T extends {}>(object: T): (keyof T)[] {
    return Object.keys(object) as (keyof T)[];
}
