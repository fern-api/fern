import { EndpointMetadata } from "./EndpointMetadata";

export type TokenSupplier<T> = T | Promise<T> | ((metadata: EndpointMetadata) => T | Promise<T>);
export const TokenSupplier = {
    get: async <T>(supplier: TokenSupplier<T>, metadata: EndpointMetadata): Promise<T> => {
        if (typeof supplier === "function") {
            return (supplier as (metadata: EndpointMetadata) => T)(metadata);
        } else {
            return supplier;
        }
    }
};
