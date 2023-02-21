export interface KeyValuePair<K extends string = string> {
    key: K;
    value: unknown;
}

export function getKeyValuePairsInOrder<K extends string>({
    keysInOrder,
    values,
}: {
    keysInOrder: readonly K[];
    values: Record<K, unknown>;
}): KeyValuePair<K>[] {
    return keysInOrder.reduce<KeyValuePair<K>[]>((acc, key) => {
        const value = values[key];
        if (value != null) {
            acc.push({ key, value });
        }
        return acc;
    }, []);
}
