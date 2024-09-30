export function stripLeadingSlash(str: string): string;
export function stripLeadingSlash(str: string | undefined): string | undefined;
export function stripLeadingSlash(str: string | undefined): string | undefined {
    return str?.replace(/^\/+/, "");
}
