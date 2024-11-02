export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
    // Type assertion is necessary since TypeScript's built-in typing for Object.entries
    // doesn't preserve the key type relationship with the value type
    return Object.entries(obj) as [keyof T, T[keyof T]][];
}
