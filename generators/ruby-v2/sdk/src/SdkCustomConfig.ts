import { BaseRubyCustomConfigSchema } from "@fern-api/ruby-ast";

export const SdkCustomConfigSchema: typeof BaseRubyCustomConfigSchema = BaseRubyCustomConfigSchema;

export type SdkCustomConfigSchema = BaseRubyCustomConfigSchema;
// example change to force a change for CI
// another one for testing