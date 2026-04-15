type ArrayFormat = "indices" | "repeat" | "comma";
interface QueryStringOptions {
    arrayFormat?: ArrayFormat;
    arrayFormats?: Record<string, ArrayFormat>;
    encode?: boolean;
}
export declare function toQueryString(obj: unknown, options?: QueryStringOptions): string;
export {};
