export function dedupedAppend<T>(item: T, arr: Array<T>, prepend?: boolean): Array<T> {
    if (arr.includes(item)) {return arr;}
    if (prepend) {
        arr.unshift(item);
    } else {
        arr.push(item);
    }
    return arr;
}
