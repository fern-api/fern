import type { GeneratorInvocationSchema } from "./schemas/index.js";

/**
 * Shown when a generator uses `output.location: rubygems` without a `github` block. That asks for the
 * gem to be pushed to RubyGems directly during generation, which the Ruby generator does not support
 * (it fails at publish time). The supported setup pairs `location: rubygems` with a `github` block so
 * the gem is published by the GitHub Actions workflow generated into the SDK repository.
 */
export const DIRECT_RUBYGEMS_PUBLISHING_UNSUPPORTED_MESSAGE =
    "Direct RubyGems publishing is not supported. Add a github block to this generator " +
    "(for example, github: { repository: your-org/your-ruby-sdk }) so the gem is published by the " +
    "GitHub Actions workflow generated in that repository.";

/** True when a generators.yml invocation requests direct RubyGems publishing (no `github` block). */
export function isDirectRubyGemsPublishing(generator: GeneratorInvocationSchema): boolean {
    return generator.output?.location === "rubygems" && generator.github == null;
}
