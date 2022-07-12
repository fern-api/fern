import { keys } from "./keys";

export type Visitor<T> = { [K in keyof T]-?: (value: T[K]) => void };

export function visit<T>(value: T, visitor: Visitor<T>): void {
    for (const key of keys(value)) {
        visitor[key](value[key]);
    }
}
