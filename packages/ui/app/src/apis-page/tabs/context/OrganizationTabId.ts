import { Values } from "@fern-api/core-utils";

export const OrganizationTabId = {
    APIS: "apis",
    ENVIRONMENTS: "environments",
    MEMBERS: "members",
    ACCESS_TOKENS: "accessTokens",
} as const;
export type OrganizationTabId = Values<typeof OrganizationTabId>;
