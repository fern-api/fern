import { Audiences } from "@fern-api/configuration";

/**
 * Helper function that expands the "instance" keyword in an audiences array.
 * This mirrors the logic in DocsDefinitionResolver.getEffectiveAudiencesForApiSection.
 */
function expandInstanceAudienceKeyword(itemAudiences: Audiences, targetAudiences?: string[]): Audiences {
    const INSTANCE_AUDIENCE_KEYWORD = "instance";

    // Only process "select" type audiences that have an array
    if (itemAudiences.type !== "select") {
        return itemAudiences;
    }

    // Check if the "instance" keyword is present in the audiences array
    if (!itemAudiences.audiences.includes(INSTANCE_AUDIENCE_KEYWORD)) {
        return itemAudiences;
    }

    // Expand "instance" keyword in-place with instance's target audiences
    const expandedAudiences: string[] = [];
    const seen = new Set<string>();

    for (const audience of itemAudiences.audiences) {
        if (audience === INSTANCE_AUDIENCE_KEYWORD) {
            // Replace "instance" with the instance's target audiences
            if (targetAudiences && targetAudiences.length > 0) {
                for (const targetAudience of targetAudiences) {
                    if (!seen.has(targetAudience)) {
                        seen.add(targetAudience);
                        expandedAudiences.push(targetAudience);
                    }
                }
            }
        } else {
            // Keep other audiences, deduplicating
            if (!seen.has(audience)) {
                seen.add(audience);
                expandedAudiences.push(audience);
            }
        }
    }

    // If expansion results in empty array, treat as "all" (no filtering)
    if (expandedAudiences.length === 0) {
        return { type: "all" };
    }

    return { type: "select", audiences: expandedAudiences };
}

describe("Instance audience inheritance", () => {
    describe("expandInstanceAudienceKeyword", () => {
        it("returns unchanged audiences when type is 'all'", () => {
            const result = expandInstanceAudienceKeyword({ type: "all" }, ["external", "internal"]);
            expect(result).toEqual({ type: "all" });
        });

        it("returns unchanged audiences when 'instance' keyword is not present", () => {
            const result = expandInstanceAudienceKeyword({ type: "select", audiences: ["beta", "internal"] }, [
                "external",
                "internal"
            ]);
            expect(result).toEqual({ type: "select", audiences: ["beta", "internal"] });
        });

        it("expands 'instance' keyword to instance's target audiences", () => {
            const result = expandInstanceAudienceKeyword({ type: "select", audiences: ["instance"] }, [
                "external",
                "internal"
            ]);
            expect(result).toEqual({ type: "select", audiences: ["external", "internal"] });
        });

        it("combines 'instance' expansion with other audiences", () => {
            const result = expandInstanceAudienceKeyword({ type: "select", audiences: ["instance", "beta"] }, [
                "external",
                "internal"
            ]);
            expect(result).toEqual({ type: "select", audiences: ["external", "internal", "beta"] });
        });

        it("preserves order: instance audiences first, then other audiences", () => {
            const result = expandInstanceAudienceKeyword({ type: "select", audiences: ["beta", "instance", "gamma"] }, [
                "external",
                "internal"
            ]);
            // beta comes first, then instance expands to external/internal, then gamma
            expect(result).toEqual({ type: "select", audiences: ["beta", "external", "internal", "gamma"] });
        });

        it("deduplicates audiences when instance audiences overlap with explicit audiences", () => {
            const result = expandInstanceAudienceKeyword({ type: "select", audiences: ["instance", "external"] }, [
                "external",
                "internal"
            ]);
            // "external" appears in both instance audiences and explicit audiences, should be deduplicated
            expect(result).toEqual({ type: "select", audiences: ["external", "internal"] });
        });

        it("returns 'all' when instance has no target audiences and only 'instance' keyword is specified", () => {
            const result = expandInstanceAudienceKeyword({ type: "select", audiences: ["instance"] }, undefined);
            expect(result).toEqual({ type: "all" });
        });

        it("returns 'all' when instance has empty target audiences and only 'instance' keyword is specified", () => {
            const result = expandInstanceAudienceKeyword({ type: "select", audiences: ["instance"] }, []);
            expect(result).toEqual({ type: "all" });
        });

        it("keeps other audiences when instance has no target audiences", () => {
            const result = expandInstanceAudienceKeyword(
                { type: "select", audiences: ["instance", "beta"] },
                undefined
            );
            // "instance" expands to nothing, but "beta" remains
            expect(result).toEqual({ type: "select", audiences: ["beta"] });
        });

        it("handles multiple 'instance' keywords (deduplicates)", () => {
            const result = expandInstanceAudienceKeyword(
                { type: "select", audiences: ["instance", "beta", "instance"] },
                ["external"]
            );
            // Both "instance" keywords expand to "external", but it's deduplicated
            expect(result).toEqual({ type: "select", audiences: ["external", "beta"] });
        });

        it("handles case where all audiences are duplicates", () => {
            const result = expandInstanceAudienceKeyword({ type: "select", audiences: ["external", "instance"] }, [
                "external"
            ]);
            // "external" is already present, "instance" expands to "external" which is deduplicated
            expect(result).toEqual({ type: "select", audiences: ["external"] });
        });
    });
});
