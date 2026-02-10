import { z } from "zod";
import { CratesPublishSchema } from "./CratesPublishSchema.js";
import { MavenPublishSchema } from "./MavenPublishSchema.js";
import { NpmPublishSchema } from "./NpmPublishSchema.js";
import { NugetPublishSchema } from "./NugetPublishSchema.js";
import { PypiPublishSchema } from "./PypiPublishSchema.js";
import { RubygemsPublishSchema } from "./RubygemsPublishSchema.js";

export const PublishSchema = z.object({
    npm: NpmPublishSchema.optional(),
    pypi: PypiPublishSchema.optional(),
    maven: MavenPublishSchema.optional(),
    nuget: NugetPublishSchema.optional(),
    rubygems: RubygemsPublishSchema.optional(),
    crates: CratesPublishSchema.optional()
});

export type PublishSchema = z.infer<typeof PublishSchema>;
