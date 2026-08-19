import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Note: This is not a JSDoc comment because we want this to be stripped from the compiled output

// Migration for version 1.0.0
//
// Context:
// Version 1.0.0 introduced a breaking change to improve code safety and correctness by
// enforcing non-null checks for required fields in generated builder methods. Previously,
// builder methods did not validate that required fields were set, which could lead to
// runtime errors when null values were passed for required fields.
//
// To ensure backwards compatibility during upgrades, this migration explicitly disables
// the required property builder checks for users upgrading from pre-1.0.0 versions.
// This allows their existing code to continue working without changes.
//
// Changed Behavior:
// - disable-required-property-builder-checks: false → true (when migrating from v0 to v1)
//   In v1, builder methods enforce non-null checks like:
//   ```java
//   @java.lang.Override
//   @JsonSetter("name")
//   public NameStage name(@NotNull String name) {
//       this.name = Objects.requireNonNull(name, "name must not be null");
//       return this;
//   }
//   ```
//   Setting this to true restores the v0 behavior without null checks.
//
// Migration Strategy:
// This migration uses the nullish coalescing assignment operator (??=) to only set
// the value if it is explicitly undefined. This means:
// - If a user has explicitly configured this field (even to false), that value is preserved
// - If the field is undefined, it is set to true for backwards compatibility
// - Unknown/custom fields are preserved
export const migration_1_0_0: Migration = {
    version: "1.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            // Set old default to disable the new required property builder checks
            // Using the nullish coalescing assignment operator (??=) to set only if undefined
            draft["disable-required-property-builder-checks"] ??= true;
        }),

    migrateGeneratorsYml: ({ document }) => document
};
