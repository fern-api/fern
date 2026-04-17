import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { getAvailabilityAnnotations } from "../utils/getAvailabilityAnnotations.js";

describe("getAvailabilityAnnotations", () => {
  it("returns no annotations when availability is undefined", () => {
    expect(getAvailabilityAnnotations(undefined)).toEqual({});
  });

  it("returns no annotations for GENERAL_AVAILABILITY", () => {
    expect(
      getAvailabilityAnnotations({
        status: FernIr.AvailabilityStatus.GeneralAvailability,
        message: undefined,
      }),
    ).toEqual({});
  });

  describe("DEPRECATED", () => {
    it("emits a bare #[deprecated] attribute when no message is provided", () => {
      const { attribute, docNote } = getAvailabilityAnnotations({
        status: FernIr.AvailabilityStatus.Deprecated,
        message: undefined,
      });

      expect(docNote).toBeUndefined();
      expect(attribute).toBeDefined();
      expect(attribute!.toString()).toBe("#[deprecated]");
    });

    it('emits #[deprecated(note = "...")] when a message is provided', () => {
      const { attribute, docNote } = getAvailabilityAnnotations({
        status: FernIr.AvailabilityStatus.Deprecated,
        message: "Use createUserV2 instead.",
      });

      expect(docNote).toBeUndefined();
      expect(attribute).toBeDefined();
      expect(attribute!.toString()).toBe(
        '#[deprecated(note = "Use createUserV2 instead.")]',
      );
    });
  });

  describe("IN_DEVELOPMENT", () => {
    it("returns the base warning when no message is provided", () => {
      const { attribute, docNote } = getAvailabilityAnnotations({
        status: FernIr.AvailabilityStatus.InDevelopment,
        message: undefined,
      });

      expect(attribute).toBeUndefined();
      expect(docNote).toBe(
        "@beta This endpoint is in development and may change.",
      );
    });

    it("appends the provided message to the warning", () => {
      const { attribute, docNote } = getAvailabilityAnnotations({
        status: FernIr.AvailabilityStatus.InDevelopment,
        message: "Expect breaking changes.",
      });

      expect(attribute).toBeUndefined();
      expect(docNote).toBe(
        "@beta This endpoint is in development and may change. Expect breaking changes.",
      );
    });
  });

  describe("PRE_RELEASE", () => {
    it("returns the base warning when no message is provided", () => {
      const { attribute, docNote } = getAvailabilityAnnotations({
        status: FernIr.AvailabilityStatus.PreRelease,
        message: undefined,
      });

      expect(attribute).toBeUndefined();
      expect(docNote).toBe(
        "@beta This endpoint is in pre-release and may change.",
      );
    });

    it("appends the provided message to the warning", () => {
      const { attribute, docNote } = getAvailabilityAnnotations({
        status: FernIr.AvailabilityStatus.PreRelease,
        message: "Contact support before depending on this.",
      });

      expect(attribute).toBeUndefined();
      expect(docNote).toBe(
        "@beta This endpoint is in pre-release and may change. Contact support before depending on this.",
      );
    });
  });
});
