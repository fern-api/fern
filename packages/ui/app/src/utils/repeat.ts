export function repeat<T>(generate: (index: number) => T, count: number): T[] {
    const elements = [];
    for (let i = 0; i < count; i++) {
        elements.push(generate(i));
    }
    return elements;
}
