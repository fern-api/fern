export type Values<T> = T[keyof T];

export function values<T>(object: T): Values<T>[] {
    return Object.values(object as any) as Values<T>[];
}
