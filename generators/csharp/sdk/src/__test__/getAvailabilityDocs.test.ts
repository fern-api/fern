import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import {
    getAvailabilityAnnotations,
    getAvailabilityDocs,
    getEndpointSummary
} from "../endpoint/utils/getAvailabilityDocs.js";

type HttpEndpoint = FernIr.HttpEndpoint;

function makeEndpoint(partial: Pick<HttpEndpoint, "availability" | "docs">): HttpEndpoint {
    // Only the `availability` and `docs` fields are read by the helpers under test;
    // the rest of the HttpEndpoint shape is intentionally omitted.
    return partial as unknown as HttpEndpoint;
}

describe("getAvailabilityDocs", () => {
    it("returns undefined when availability is undefined", () => {
        expect(
            getAvailabilityDocs({
                endpoint: makeEndpoint({ availability: undefined, docs: undefined }),
                enabled: true
            })
        ).toBeUndefined();
    });

    it("returns undefined for Deprecated (native [Obsolete] attribute is used instead)", () => {
        expect(
            getAvailabilityDocs({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.Deprecated,
                        message: undefined
                    },
                    docs: undefined
                }),
                enabled: true
            })
        ).toBeUndefined();
        expect(
            getAvailabilityDocs({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.Deprecated,
                        message: "Use v2 instead"
                    },
                    docs: undefined
                }),
                enabled: true
            })
        ).toBeUndefined();
    });

    it("returns @beta warning for InDevelopment status without message", () => {
        expect(
            getAvailabilityDocs({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.InDevelopment,
                        message: undefined
                    },
                    docs: undefined
                }),
                enabled: true
            })
        ).toBe("@beta This endpoint is in development and may change.");
    });

    it("returns @beta warning with message for InDevelopment status with message", () => {
        expect(
            getAvailabilityDocs({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.InDevelopment,
                        message: "Expected Q3 release"
                    },
                    docs: undefined
                }),
                enabled: true
            })
        ).toBe("@beta This endpoint is in development and may change. Expected Q3 release");
    });

    it("returns @beta warning for PreRelease status without message", () => {
        expect(
            getAvailabilityDocs({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.PreRelease,
                        message: undefined
                    },
                    docs: undefined
                }),
                enabled: true
            })
        ).toBe("@beta This endpoint is in pre-release and may change.");
    });

    it("returns @beta warning with message for PreRelease status with message", () => {
        expect(
            getAvailabilityDocs({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.PreRelease,
                        message: "Beta 2"
                    },
                    docs: undefined
                }),
                enabled: true
            })
        ).toBe("@beta This endpoint is in pre-release and may change. Beta 2");
    });

    it("returns undefined for GeneralAvailability status", () => {
        expect(
            getAvailabilityDocs({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.GeneralAvailability,
                        message: undefined
                    },
                    docs: undefined
                }),
                enabled: true
            })
        ).toBeUndefined();
    });

    it("returns undefined when the flag is disabled, regardless of availability", () => {
        for (const status of [
            FernIr.AvailabilityStatus.Deprecated,
            FernIr.AvailabilityStatus.InDevelopment,
            FernIr.AvailabilityStatus.PreRelease,
            FernIr.AvailabilityStatus.GeneralAvailability
        ]) {
            expect(
                getAvailabilityDocs({
                    endpoint: makeEndpoint({
                        availability: { status, message: "any" },
                        docs: undefined
                    }),
                    enabled: false
                })
            ).toBeUndefined();
        }
    });
});

describe("getEndpointSummary", () => {
    it("returns the endpoint's docs unchanged when availability is undefined", () => {
        expect(
            getEndpointSummary({
                endpoint: makeEndpoint({
                    availability: undefined,
                    docs: "Original docs"
                }),
                enabled: true
            })
        ).toBe("Original docs");
    });

    it("returns undefined when there are no docs and no availability note", () => {
        expect(
            getEndpointSummary({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.GeneralAvailability,
                        message: undefined
                    },
                    docs: undefined
                }),
                enabled: true
            })
        ).toBeUndefined();
    });

    it("returns just the availability note when docs are missing", () => {
        expect(
            getEndpointSummary({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.InDevelopment,
                        message: undefined
                    },
                    docs: undefined
                }),
                enabled: true
            })
        ).toBe("@beta This endpoint is in development and may change.");
    });

    it("prefixes the endpoint's docs with the availability note when both are present", () => {
        expect(
            getEndpointSummary({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.PreRelease,
                        message: undefined
                    },
                    docs: "Fetches a plant by id."
                }),
                enabled: true
            })
        ).toBe("@beta This endpoint is in pre-release and may change.\n\nFetches a plant by id.");
    });

    it("returns docs unchanged for Deprecated (annotation handles the marker)", () => {
        expect(
            getEndpointSummary({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.Deprecated,
                        message: "Use v2 instead"
                    },
                    docs: "Fetches a plant by id."
                }),
                enabled: true
            })
        ).toBe("Fetches a plant by id.");
    });

    it("returns docs unchanged when the flag is disabled, regardless of availability", () => {
        expect(
            getEndpointSummary({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.InDevelopment,
                        message: "Beta"
                    },
                    docs: "Fetches a plant by id."
                }),
                enabled: false
            })
        ).toBe("Fetches a plant by id.");
        expect(
            getEndpointSummary({
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.PreRelease,
                        message: undefined
                    },
                    docs: undefined
                }),
                enabled: false
            })
        ).toBeUndefined();
    });
});

describe("getAvailabilityAnnotations", () => {
    // A minimal stub for the CSharp type that the helper interacts with. We capture the
    // arguments passed to `annotation`/`classReference` so we can verify the shape.
    function makeCsharpStub() {
        const calls: {
            annotation: Array<{ reference: unknown; argument: unknown }>;
            classReference: Array<{ name: string; namespace: string }>;
        } = { annotation: [], classReference: [] };

        const stub = {
            classReference(args: { name: string; namespace: string }) {
                calls.classReference.push(args);
                return { __kind: "classReference", ...args } as unknown;
            },
            annotation(args: { reference: unknown; argument: unknown }) {
                calls.annotation.push(args);
                return { __kind: "annotation", ...args } as unknown;
            }
        };

        return { stub, calls };
    }

    it("returns an empty array when availability is undefined", () => {
        const { stub, calls } = makeCsharpStub();
        const result = getAvailabilityAnnotations({
            csharp: stub as never,
            endpoint: makeEndpoint({ availability: undefined, docs: undefined }),
            enabled: true
        });
        expect(result).toEqual([]);
        expect(calls.annotation).toHaveLength(0);
    });

    it("returns [Obsolete] with no argument for Deprecated without a message", () => {
        const { stub, calls } = makeCsharpStub();
        const result = getAvailabilityAnnotations({
            csharp: stub as never,
            endpoint: makeEndpoint({
                availability: {
                    status: FernIr.AvailabilityStatus.Deprecated,
                    message: undefined
                },
                docs: undefined
            }),
            enabled: true
        });
        expect(result).toHaveLength(1);
        expect(calls.classReference).toEqual([{ name: "ObsoleteAttribute", namespace: "System" }]);
        expect(calls.annotation[0]?.argument).toBeUndefined();
    });

    it('returns [Obsolete("message")] for Deprecated with a message', () => {
        const { stub, calls } = makeCsharpStub();
        const result = getAvailabilityAnnotations({
            csharp: stub as never,
            endpoint: makeEndpoint({
                availability: {
                    status: FernIr.AvailabilityStatus.Deprecated,
                    message: "Use v2 instead"
                },
                docs: undefined
            }),
            enabled: true
        });
        expect(result).toHaveLength(1);
        expect(calls.annotation[0]?.argument).toBe('"Use v2 instead"');
    });

    it("escapes embedded quotes and backslashes in the deprecation message", () => {
        const { stub, calls } = makeCsharpStub();
        getAvailabilityAnnotations({
            csharp: stub as never,
            endpoint: makeEndpoint({
                availability: {
                    status: FernIr.AvailabilityStatus.Deprecated,
                    message: 'use "v2" with path C:\\api'
                },
                docs: undefined
            }),
            enabled: true
        });
        expect(calls.annotation[0]?.argument).toBe('"use \\"v2\\" with path C:\\\\api"');
    });

    it("returns no annotation for non-Deprecated statuses", () => {
        const { stub } = makeCsharpStub();
        for (const status of [
            FernIr.AvailabilityStatus.InDevelopment,
            FernIr.AvailabilityStatus.PreRelease,
            FernIr.AvailabilityStatus.GeneralAvailability
        ]) {
            expect(
                getAvailabilityAnnotations({
                    csharp: stub as never,
                    endpoint: makeEndpoint({
                        availability: { status, message: undefined },
                        docs: undefined
                    }),
                    enabled: true
                })
            ).toEqual([]);
        }
    });

    it("returns [] when the flag is disabled, even for Deprecated", () => {
        const { stub, calls } = makeCsharpStub();
        expect(
            getAvailabilityAnnotations({
                csharp: stub as never,
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.Deprecated,
                        message: "Use v2 instead"
                    },
                    docs: undefined
                }),
                enabled: false
            })
        ).toEqual([]);
        expect(calls.annotation).toHaveLength(0);
        expect(calls.classReference).toHaveLength(0);
    });
});
