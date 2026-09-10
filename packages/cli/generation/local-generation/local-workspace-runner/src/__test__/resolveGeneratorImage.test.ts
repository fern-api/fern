import { describe, expect, it } from "vitest";
import { resolveGeneratorImage } from "../constants";

describe("resolveGeneratorImage", () => {
    it("tags a bare generator name with its version", () => {
        expect(
            resolveGeneratorImage({
                containerImage: undefined,
                name: "fernapi/fern-python-sdk",
                version: "4.0.0"
            })
        ).toBe("fernapi/fern-python-sdk:4.0.0");
    });

    it("prefers an explicit container image over the generator name", () => {
        expect(
            resolveGeneratorImage({
                containerImage: "ghcr.io/acme/fern-python-sdk",
                name: "fernapi/fern-python-sdk",
                version: "4.0.0"
            })
        ).toBe("ghcr.io/acme/fern-python-sdk:4.0.0");
    });

    it("returns a pinned digest unchanged rather than appending a tag", () => {
        const digest = `ghcr.io/acme/fern-python-sdk@sha256:${"a".repeat(64)}`;

        expect(
            resolveGeneratorImage({
                containerImage: digest,
                name: "fernapi/fern-python-sdk",
                version: "4.0.0"
            })
        ).toBe(digest);
    });

    /**
     * `USE_FERN_RC` runs the adapter's current pre-release rather than the version the workspace
     * asks for, so the same generators.yml serves a customer on a release version and us on an rc.
     */
    describe("USE_FERN_RC", () => {
        const ON_PREM_ADAPTER = {
            containerImage: undefined,
            name: "fernapi/fern-python-sdk",
            version: "6.0.0"
        };

        it("runs the language's moving rc tag for an on-prem adapter invocation", () => {
            expect(resolveGeneratorImage(ON_PREM_ADAPTER, { USE_FERN_RC: "true" })).toBe(
                "fernenterprise/fern-python-sdk:rc"
            );
        });

        it("accepts 1, and ignores surrounding whitespace and case", () => {
            expect(resolveGeneratorImage(ON_PREM_ADAPTER, { USE_FERN_RC: "1" })).toBe(
                "fernenterprise/fern-python-sdk:rc"
            );
            expect(resolveGeneratorImage(ON_PREM_ADAPTER, { USE_FERN_RC: " TRUE " })).toBe(
                "fernenterprise/fern-python-sdk:rc"
            );
        });

        it("is off unless asked for, including for anything other than true", () => {
            expect(resolveGeneratorImage(ON_PREM_ADAPTER, {})).toBe("fernapi/fern-python-sdk:6.0.0");
            expect(resolveGeneratorImage(ON_PREM_ADAPTER, { USE_FERN_RC: "false" })).toBe(
                "fernapi/fern-python-sdk:6.0.0"
            );
            expect(resolveGeneratorImage(ON_PREM_ADAPTER, { USE_FERN_RC: "yes" })).toBe(
                "fernapi/fern-python-sdk:6.0.0"
            );
        });

        // Fern's own generator of the same name publishes no rc tag, so substituting one would run
        // an image that does not exist -- or, worse, somebody else's.
        it("leaves a generator below the cutover alone", () => {
            expect(
                resolveGeneratorImage(
                    { containerImage: undefined, name: "fernapi/fern-python-sdk", version: "5.9.0" },
                    { USE_FERN_RC: "true" }
                )
            ).toBe("fernapi/fern-python-sdk:5.9.0");
        });

        it("leaves a generator the adapter does not replace alone", () => {
            expect(
                resolveGeneratorImage(
                    { containerImage: undefined, name: "fernapi/fern-postman", version: "9.9.9" },
                    { USE_FERN_RC: "true" }
                )
            ).toBe("fernapi/fern-postman:9.9.9");
        });

        // Pinning an exact artifact is deliberate, so it outranks a switch that says "something
        // newer" -- otherwise a pinned run would silently stop being pinned.
        it("does not override a pinned digest", () => {
            const digest = `fernenterprise/fern-python-sdk@sha256:${"b".repeat(64)}`;

            expect(
                resolveGeneratorImage(
                    { containerImage: digest, name: "fernapi/fern-python-sdk", version: "6.0.0" },
                    { USE_FERN_RC: "true" }
                )
            ).toBe(digest);
        });

        it("substitutes the language's own reference, not python's, for every adapter name", () => {
            expect(
                resolveGeneratorImage(
                    {
                        containerImage: undefined,
                        name: "fernapi/fern-typescript-node-sdk",
                        version: "4.0.0"
                    },
                    { USE_FERN_RC: "true" }
                )
            ).toBe("fernenterprise/fern-typescript-sdk:rc");
        });
    });
});
