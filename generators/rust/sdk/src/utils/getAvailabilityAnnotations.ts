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
   * Rust does not have a first-class attribute for the availability status.
   * Rendered as a top-level rustdoc `# Stability` section, grouped with the
   * standard `# Examples` / `# Errors` / `# Panics` / `# Safety` headers.
   */
  docNote?: string;
}

/**
 * Maps an endpoint's availability to Rust annotations. Deprecated endpoints
 * are surfaced via Rust's built-in `#[deprecated]` attribute. In-development
 * and pre-release endpoints use an idiomatic rustdoc `# Stability` section.
 */
export function getAvailabilityAnnotations(
  availability: FernIr.Availability | undefined,
): AvailabilityAnnotations {
  if (availability == null) {
    return {};
  }

  return FernIr.AvailabilityStatus._visit<AvailabilityAnnotations>(availability.status, {
    deprecated: () => {
      const args =
        availability.message != null
          ? [`note = ${JSON.stringify(availability.message)}`]
          : undefined;
      return { attribute: rust.attribute({ name: "deprecated", args }) };
    },
    inDevelopment: () => {
      const warning = "This endpoint is in development and may change.";
      const body = availability.message != null ? `${warning} ${availability.message}` : warning;
      return { docNote: `# Stability\n\n${body}` };
    },
    preRelease: () => {
      const warning = "This endpoint is in pre-release and may change.";
      const body = availability.message != null ? `${warning} ${availability.message}` : warning;
      return { docNote: `# Stability\n\n${body}` };
    },
    generalAvailability: () => ({}),
    // Forward-compatible: unknown availability statuses from newer IR versions
    // produce no annotations rather than throwing.
    _other: () => ({}),
  });
}
