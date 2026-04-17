import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { getAvailabilityDocs } from "../getAvailabilityDocs.js";

const makeEndpoint = (availability: FernIr.Availability | undefined): FernIr.HttpEndpoint =>
    ({ availability }) as unknown as FernIr.HttpEndpoint;

describe("getAvailabilityDocs", () => {
    it("returns undefined when availability is not set", () => {
        expect(getAvailabilityDocs(makeEndpoint(undefined))).toBeUndefined();
    });

    it("returns undefined for GeneralAvailability with no message", () => {
        expect(
            getAvailabilityDocs(
                makeEndpoint({ status: FernIr.AvailabilityStatus.GeneralAvailability, message: undefined })
            )
        ).toBeUndefined();
    });

    it("returns undefined for GeneralAvailability even when a message is provided", () => {
        expect(
            getAvailabilityDocs(
                makeEndpoint({ status: FernIr.AvailabilityStatus.GeneralAvailability, message: "all good" })
            )
        ).toBeUndefined();
    });

    it("returns @deprecated tag for Deprecated with no message", () => {
        expect(
            getAvailabilityDocs(makeEndpoint({ status: FernIr.AvailabilityStatus.Deprecated, message: undefined }))
        ).toBe("@deprecated");
    });

    it("returns a Sphinx deprecated block for Deprecated with a message", () => {
        expect(
            getAvailabilityDocs(
                makeEndpoint({ status: FernIr.AvailabilityStatus.Deprecated, message: "use getMovieV2 instead" })
            )
        ).toBe(".. deprecated::\n    use getMovieV2 instead");
    });

    it("returns the in-development beta warning with no message", () => {
        expect(
            getAvailabilityDocs(makeEndpoint({ status: FernIr.AvailabilityStatus.InDevelopment, message: undefined }))
        ).toBe("@beta This endpoint is in development and may change.");
    });

    it("appends the message to the in-development beta warning when provided", () => {
        expect(
            getAvailabilityDocs(
                makeEndpoint({ status: FernIr.AvailabilityStatus.InDevelopment, message: "schema will change" })
            )
        ).toBe("@beta This endpoint is in development and may change. schema will change");
    });

    it("returns the pre-release beta warning with no message", () => {
        expect(
            getAvailabilityDocs(makeEndpoint({ status: FernIr.AvailabilityStatus.PreRelease, message: undefined }))
        ).toBe("@beta This endpoint is in pre-release and may change.");
    });

    it("appends the message to the pre-release beta warning when provided", () => {
        expect(
            getAvailabilityDocs(makeEndpoint({ status: FernIr.AvailabilityStatus.PreRelease, message: "expect bugs" }))
        ).toBe("@beta This endpoint is in pre-release and may change. expect bugs");
    });
});
