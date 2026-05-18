import type * as SeedApi from "../../../index.js";
export interface UserResponse {
    id: string;
    username: string;
    email: string | null;
    phone?: (string | null) | undefined;
    createdAt: string;
    updatedAt: string | null;
    address?: (SeedApi.nullableOptional.Address | null) | undefined;
}
