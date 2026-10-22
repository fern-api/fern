export function stripTrailingSlashes(str: string): string;
export function stripTrailingSlashes(str: string | undefined): string | undefined;
export function stripTrailingSlashes(str: string | undefined): string | undefined {
    return str?.replace(/\/+$/, "");
}
