import { getGenericDetails } from "./getGenericDetails";

export function isGeneric(name: string): boolean {
    const genericDetails = getGenericDetails(name);
    return genericDetails ? genericDetails.isGeneric : false;
}
