import { Audiences } from "@fern-api/configuration";
import { FernNavigation } from "@fern-api/fdr-sdk";

export function withAudience(audiences: Audiences): FernNavigation.AudienceId[] | undefined {
    return audiences.type === "select" && audiences.audiences.length > 0
        ? audiences.audiences.map((audience) => FernNavigation.AudienceId(audience))
        : undefined;
}
