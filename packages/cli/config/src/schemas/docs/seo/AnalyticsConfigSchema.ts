import { z } from "zod";

export const SegmentConfigSchema = z.object({
    writeKey: z.string()
});

export type SegmentConfigSchema = z.infer<typeof SegmentConfigSchema>;

export const FullStoryConfigSchema = z.object({
    orgId: z.string()
});

export type FullStoryConfigSchema = z.infer<typeof FullStoryConfigSchema>;

export const PostHogConfigSchema = z.object({
    apiKey: z.string(),
    endpoint: z.string().optional()
});

export type PostHogConfigSchema = z.infer<typeof PostHogConfigSchema>;

export const GtmConfigSchema = z.object({
    containerId: z.string()
});

export type GtmConfigSchema = z.infer<typeof GtmConfigSchema>;

export const GoogleAnalytics4ConfigSchema = z.object({
    measurementId: z.string()
});

export type GoogleAnalytics4ConfigSchema = z.infer<typeof GoogleAnalytics4ConfigSchema>;

export const IntercomAnalyticsConfigSchema = z.object({
    appId: z.string(),
    apiBase: z.string().optional()
});

export type IntercomAnalyticsConfigSchema = z.infer<typeof IntercomAnalyticsConfigSchema>;

export const AnalyticsConfigSchema = z.object({
    segment: SegmentConfigSchema.optional(),
    fullstory: FullStoryConfigSchema.optional(),
    intercom: IntercomAnalyticsConfigSchema.optional(),
    posthog: PostHogConfigSchema.optional(),
    gtm: GtmConfigSchema.optional(),
    ga4: GoogleAnalytics4ConfigSchema.optional()
});

export type AnalyticsConfigSchema = z.infer<typeof AnalyticsConfigSchema>;
