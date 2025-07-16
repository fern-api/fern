export type Values<T> = T[keyof T];

export function values<T extends object>(object: T): Values<T>[] {
    return Object.values(object) as Values<T>[];
}
