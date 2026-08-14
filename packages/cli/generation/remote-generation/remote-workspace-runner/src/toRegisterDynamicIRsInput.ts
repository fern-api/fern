import type { APIV1Write } from "@fern-api/fdr-sdk";

type DynamicIr = APIV1Write.DynamicIr;

/**
 * FDR only reads the language keys of `dynamicIRs` when registering an API definition — it mints one
 * presigned upload URL per language, and the IRs themselves are uploaded directly to S3 afterwards.
 * Sending the IR bodies inline duplicates the entire IR once per language in the registration request
 * body, which can exceed the server's request size limit for large APIs.
 */
export function toRegisterDynamicIRsInput(
    dynamicIRsByLanguage: Record<string, DynamicIr> | undefined
): Record<string, DynamicIr> | undefined {
    if (dynamicIRsByLanguage == null) {
        return undefined;
    }
    return Object.fromEntries(Object.keys(dynamicIRsByLanguage).map((language) => [language, {}]));
}
