import { z } from "zod";
import { CratesPublishSchema } from "./CratesPublishSchema";
import { MavenPublishSchema } from "./MavenPublishSchema";
import { NpmPublishSchema } from "./NpmPublishSchema";
import { NugetPublishSchema } from "./NugetPublishSchema";
import { PypiPublishSchema } from "./PypiPublishSchema";
import { RubygemsPublishSchema } from "./RubygemsPublishSchema";

export const PublishSchema = z.object({
    npm: NpmPublishSchema.optional(),
    pypi: PypiPublishSchema.optional(),
    maven: MavenPublishSchema.optional(),
    nuget: NugetPublishSchema.optional(),
    rubygems: RubygemsPublishSchema.optional(),
    crates: CratesPublishSchema.optional()
});

export type PublishSchema = z.infer<typeof PublishSchema>;
