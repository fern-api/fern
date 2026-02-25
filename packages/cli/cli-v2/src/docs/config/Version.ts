import type { schemas } from "@fern-api/config";

export interface Version {
    "display-name": string;
    path: string;
    slug?: string;
    availability?: schemas.AvailabilitySchema;
}
