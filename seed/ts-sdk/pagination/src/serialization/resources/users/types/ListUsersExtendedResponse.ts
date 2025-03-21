/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as SeedPagination from "../../../../api/index";
import * as core from "../../../../core";
import { UserPage } from "./UserPage";

export const ListUsersExtendedResponse: core.serialization.ObjectSchema<
    serializers.ListUsersExtendedResponse.Raw,
    SeedPagination.ListUsersExtendedResponse
> = core.serialization
    .object({
        totalCount: core.serialization.property("total_count", core.serialization.number()),
    })
    .extend(UserPage);

export declare namespace ListUsersExtendedResponse {
    export interface Raw extends UserPage.Raw {
        total_count: number;
    }
}
