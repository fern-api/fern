import { FernIr } from "@fern-fern/ir-sdk";
import { Attribute, rust } from "@fern-api/rust-codegen";

export interface AvailabilityAnnotations {
  /**
   * Rust attribute (e.g. `#[deprecated(note = "...")]`) to render above the
   * function signature when the endpoint has a built-in annotation available.
   */
  attribute?: Attribute;
  /**
   * Free-form documentation note to prepend to the doc comment summary when
   * Rust does not have a first-class attribute for the availability status
   * (e.g. `@beta This endpoint is in pre-release and may change.`).
   */
  docNote?: string;
}

/**
 * Maps an endpoint's availability to Rust annotations. Deprecated endpoints
 * are surfaced via Rust's built-in `#[deprecated]` attribute. In-development
 * and pre-release endpoints fall back to a `@beta` doc comment matching the
 * wording used by the TypeScript SDK generator.
 */
export function getAvailabilityAnnotations(
  availability: FernIr.Availability | undefined,
): AvailabilityAnnotations {
  if (availability == null) {
    return {};
  }

  switch (availability.status) {
    case FernIr.AvailabilityStatus.Deprecated: {
      const args =
        availability.message != null
          ? [`note = ${JSON.stringify(availability.message)}`]
          : undefined;
      return { attribute: rust.attribute({ name: "deprecated", args }) };
    }
    case FernIr.AvailabilityStatus.InDevelopment: {
      const warning = "@beta This endpoint is in development and may change.";
      return {
        docNote:
          availability.message != null
            ? `${warning} ${availability.message}`
            : warning,
      };
    }
    case FernIr.AvailabilityStatus.PreRelease: {
      const warning = "@beta This endpoint is in pre-release and may change.";
      return {
        docNote:
          availability.message != null
            ? `${warning} ${availability.message}`
            : warning,
      };
    }
    case FernIr.AvailabilityStatus.GeneralAvailability:
      return {};
    default:
      return {};
  }
}
