import { BaseRubyCustomConfigSchema } from "@fern-api/ruby-ast";

export const SdkCustomConfigSchema: typeof BaseRubyCustomConfigSchema = BaseRubyCustomConfigSchema;
// force a failure for CI test
export type SdkCustomConfigSchema = BaseRubyCustomConfigSchema;
