import { camelCase } from "lodash-es";

export function getHeaderName(headerWireKey: string): string {
    const headerWithoutXPrefix = headerWireKey.replace(/^x-|^X-/, "");
    return camelCase(headerWithoutXPrefix);
}
