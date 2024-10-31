export type Entries<T> = [keyof T, T[keyof T]][];

export function entries<T>(object: T): Entries<T> {
    return Object.entries(object as any) as Entries<T>;
}
