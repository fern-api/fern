export function removeSuffix({ value, suffix }: { value: string; suffix: string }): string {
    if (value.endsWith(suffix)) {
        return value.substring(0, value.length - suffix.length);
    }
    return value;
}
