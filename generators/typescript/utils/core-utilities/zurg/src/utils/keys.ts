export function keys<T extends object>(obj: T): (keyof T)[] {
    // Type assertion necessary since Object.keys returns string[]
    return Object.keys(obj) as (keyof T)[];
}
