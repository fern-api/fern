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

const DEFAULT_PREFIX = "FERN";

describe("getAvailabilityDocs", () => {
    it("returns undefined when availability is undefined", () => {
        expect(
            getAvailabilityDocs({
                endpoint: makeEndpoint({ availability: undefined, docs: undefined }),
                enabled: true
            })
        ).toBeUndefined();
    });

    it("returns undefined for every availability tier (attributes carry the signal)", () => {
        for (const status of [
            FernIr.AvailabilityStatus.Deprecated,
            FernIr.AvailabilityStatus.InDevelopment,
            FernIr.AvailabilityStatus.PreRelease,
            FernIr.AvailabilityStatus.GeneralAvailability
        ]) {
            expect(
                getAvailabilityDocs({
                    endpoint: makeEndpoint({
                        availability: { status, message: undefined },
                        docs: undefined
                    }),
                    enabled: true
                })
            ).toBeUndefined();
            expect(
                getAvailabilityDocs({
                    endpoint: makeEndpoint({
                        availability: { status, message: "some message" },
                        docs: undefined
                    }),
                    enabled: true
                })
            ).toBeUndefined();
        }
    });

    it("returns undefined when the flag is disabled", () => {
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

    it("returns the endpoint's docs unchanged for every availability tier", () => {
        for (const status of [
            FernIr.AvailabilityStatus.Deprecated,
            FernIr.AvailabilityStatus.InDevelopment,
            FernIr.AvailabilityStatus.PreRelease,
            FernIr.AvailabilityStatus.GeneralAvailability
        ]) {
            expect(
                getEndpointSummary({
                    endpoint: makeEndpoint({
                        availability: { status, message: undefined },
                        docs: "Fetches a plant by id."
                    }),
                    enabled: true
                })
            ).toBe("Fetches a plant by id.");
        }
    });

    it("returns undefined when there are no docs and no availability note", () => {
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
        ).toBeUndefined();
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
            classReference: Array<{ name: string; namespace: string; fullyQualified?: boolean }>;
        } = { annotation: [], classReference: [] };

        const stub = {
            classReference(args: { name: string; namespace: string; fullyQualified?: boolean }) {
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
            enabled: true,
            diagnosticPrefix: DEFAULT_PREFIX
        });
        expect(result).toEqual([]);
        expect(calls.annotation).toHaveLength(0);
    });

    it("returns [System.ObsoleteAttribute] with no argument for Deprecated without a message", () => {
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
            enabled: true,
            diagnosticPrefix: DEFAULT_PREFIX
        });
        expect(result).toHaveLength(1);
        expect(calls.classReference).toEqual([
            { name: "ObsoleteAttribute", namespace: "System", fullyQualified: true }
        ]);
        expect(calls.annotation[0]?.argument).toBeUndefined();
    });

    it('returns [System.ObsoleteAttribute("message")] for Deprecated with a message', () => {
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
            enabled: true,
            diagnosticPrefix: DEFAULT_PREFIX
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
            enabled: true,
            diagnosticPrefix: DEFAULT_PREFIX
        });
        expect(calls.annotation[0]?.argument).toBe('"use \\"v2\\" with path C:\\\\api"');
    });

    it('returns [System.Diagnostics.CodeAnalysis.ExperimentalAttribute("…0001")] for InDevelopment', () => {
        const { stub, calls } = makeCsharpStub();
        const result = getAvailabilityAnnotations({
            csharp: stub as never,
            endpoint: makeEndpoint({
                availability: {
                    status: FernIr.AvailabilityStatus.InDevelopment,
                    message: undefined
                },
                docs: undefined
            }),
            enabled: true,
            diagnosticPrefix: "ACME"
        });
        expect(result).toHaveLength(1);
        expect(calls.classReference).toEqual([
            { name: "ExperimentalAttribute", namespace: "System.Diagnostics.CodeAnalysis", fullyQualified: true }
        ]);
        expect(calls.annotation[0]?.argument).toBe('"ACME0001"');
    });

    it('returns [System.Diagnostics.CodeAnalysis.ExperimentalAttribute("…0002")] for PreRelease', () => {
        const { stub, calls } = makeCsharpStub();
        const result = getAvailabilityAnnotations({
            csharp: stub as never,
            endpoint: makeEndpoint({
                availability: {
                    status: FernIr.AvailabilityStatus.PreRelease,
                    message: "Beta 2"
                },
                docs: undefined
            }),
            enabled: true,
            diagnosticPrefix: "ACME"
        });
        expect(result).toHaveLength(1);
        expect(calls.classReference).toEqual([
            { name: "ExperimentalAttribute", namespace: "System.Diagnostics.CodeAnalysis", fullyQualified: true }
        ]);
        expect(calls.annotation[0]?.argument).toBe('"ACME0002"');
    });

    it("uses the provided diagnostic prefix when forming the Experimental id", () => {
        const { stub, calls } = makeCsharpStub();
        getAvailabilityAnnotations({
            csharp: stub as never,
            endpoint: makeEndpoint({
                availability: {
                    status: FernIr.AvailabilityStatus.InDevelopment,
                    message: undefined
                },
                docs: undefined
            }),
            enabled: true,
            diagnosticPrefix: "XYZ"
        });
        expect(calls.annotation[0]?.argument).toBe('"XYZ0001"');
    });

    it("returns [] for GeneralAvailability", () => {
        const { stub, calls } = makeCsharpStub();
        expect(
            getAvailabilityAnnotations({
                csharp: stub as never,
                endpoint: makeEndpoint({
                    availability: {
                        status: FernIr.AvailabilityStatus.GeneralAvailability,
                        message: undefined
                    },
                    docs: undefined
                }),
                enabled: true,
                diagnosticPrefix: DEFAULT_PREFIX
            })
        ).toEqual([]);
        expect(calls.annotation).toHaveLength(0);
    });

    it("returns [] when the flag is disabled, even for Deprecated or InDevelopment", () => {
        const { stub, calls } = makeCsharpStub();
        for (const status of [FernIr.AvailabilityStatus.Deprecated, FernIr.AvailabilityStatus.InDevelopment]) {
            expect(
                getAvailabilityAnnotations({
                    csharp: stub as never,
                    endpoint: makeEndpoint({
                        availability: { status, message: "Use v2 instead" },
                        docs: undefined
                    }),
                    enabled: false,
                    diagnosticPrefix: DEFAULT_PREFIX
                })
            ).toEqual([]);
        }
        expect(calls.annotation).toHaveLength(0);
        expect(calls.classReference).toHaveLength(0);
    });
});
