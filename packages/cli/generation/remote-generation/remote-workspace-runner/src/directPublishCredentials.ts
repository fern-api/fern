const MAX_PUBLISH_CREDENTIAL_FIELD_LENGTH = 16 * 1024;
export const MAX_PUBLISH_CREDENTIALS_BYTES = 64 * 1024;
const MAX_PUBLISH_CREDENTIAL_TARGETS = 64;

export type FernSdkGenApiPublishCredentialSource =
    | { registry: "npm"; token?: string }
    | { registry: "crates"; token?: string }
    | { registry: "pypi"; username?: string; password?: string }
    | {
          registry: "maven";
          username?: string;
          password?: string;
          signature?: { keyId?: string; password?: string; secretKey?: string };
      }
    | { registry: "nuget" | "rubygems" | "go" | "composer" | "postman" };

export type FernSdkGenApiResolvedPublishCredentialSource =
    | { registry: "npm"; token: string }
    | { registry: "crates"; token: string }
    | { registry: "pypi"; username: string; password: string }
    | {
          registry: "maven";
          username: string;
          password: string;
          signature?: { keyId: string; password: string; secretKey: string };
      };

export interface FernSdkGenApiPublishTargetValidationInput {
    publicationRequested: boolean;
    credentialsRequired: boolean;
    publishRegistry?: string;
    publishUrl?: string;
    publishCredential?: FernSdkGenApiPublishCredentialSource;
}

export function resolveFernSdkGenApiPublishCredentialSource(
    source: FernSdkGenApiPublishCredentialSource,
    publishUrl?: string,
    publishRegistry?: string
): FernSdkGenApiResolvedPublishCredentialSource {
    if (publishRegistry != null && source.registry !== publishRegistry) {
        throw new Error(
            `Direct publication credential registry ${source.registry} does not match requested registry ${publishRegistry}`
        );
    }
    if (publishUrl != null) {
        assertSafeDirectPublishUrl(publishUrl);
    }
    switch (source.registry) {
        case "npm":
        case "crates":
            assertDirectCredential(source.registry, "token", source.token);
            return { registry: source.registry, token: source.token };
        case "pypi":
            assertDirectCredential("pypi", "username", source.username);
            assertDirectCredential("pypi", "password", source.password);
            return { registry: "pypi", username: source.username, password: source.password };
        case "maven": {
            assertDirectCredential("maven", "username", source.username);
            assertDirectCredential("maven", "password", source.password);
            const signature = resolveMavenSignature(source.signature);
            return {
                registry: "maven",
                username: source.username,
                password: source.password,
                ...(signature == null ? {} : { signature })
            };
        }
        case "nuget":
        case "rubygems":
        case "go":
        case "composer":
        case "postman":
            throw new Error(`sdk-gen-api does not support direct ${source.registry} registry publication`);
    }
}

export function validateFernSdkGenApiPublishUrl(value: string): void {
    assertSafeDirectPublishUrl(value);
}

export function validateFernSdkGenApiPublishTargets(inputs: FernSdkGenApiPublishTargetValidationInput[]): void {
    const resolved = inputs.flatMap((input) => {
        if (!input.publicationRequested) {
            return [];
        }
        if (input.publishCredential == null) {
            if (input.credentialsRequired) {
                throw new Error("SDK Config direct publication is missing its credential configuration");
            }
            return [];
        }
        return [
            resolveFernSdkGenApiPublishCredentialSource(
                input.publishCredential,
                input.publishUrl,
                input.publishRegistry
            )
        ];
    });
    if (resolved.length > MAX_PUBLISH_CREDENTIAL_TARGETS) {
        throw new Error(
            `sdk-gen-api supports at most ${MAX_PUBLISH_CREDENTIAL_TARGETS} direct publish credential targets`
        );
    }
    const body = Buffer.from(
        JSON.stringify({
            schemaVersion: "fern-publish-credentials/v1",
            credentialSetId: "00000000-0000-8000-8000-000000000000",
            targets: resolved.map((credential) => ({ targetId: "0".repeat(20), ...credential }))
        })
    );
    if (body.length > MAX_PUBLISH_CREDENTIALS_BYTES) {
        throw new Error(
            `sdk-gen-api publish credentials file is ${formatKiB(body.length)}, exceeding the 64 KiB limit`
        );
    }
}

function resolveMavenSignature(
    signature: { keyId?: string; password?: string; secretKey?: string } | undefined
): { keyId: string; password: string; secretKey: string } | undefined {
    if (signature == null) {
        return undefined;
    }
    assertDirectCredential("maven", "signature.keyId", signature.keyId);
    assertDirectCredential("maven", "signature.password", signature.password);
    assertDirectCredential("maven", "signature.secretKey", signature.secretKey);
    return { keyId: signature.keyId, password: signature.password, secretKey: signature.secretKey };
}

function assertDirectCredential(registry: string, field: string, value: string | undefined): asserts value is string {
    if (value == null || value.trim().length === 0) {
        throw new Error(`Direct ${registry} publication through sdk-gen-api requires ${field}`);
    }
    if (value.trim() === "OIDC" || value.trim() === "<USE_OIDC>") {
        throw new Error(`Direct ${registry} publication through sdk-gen-api does not support OIDC credentials`);
    }
    if (Buffer.byteLength(value, "utf8") > MAX_PUBLISH_CREDENTIAL_FIELD_LENGTH) {
        throw new Error(`Direct ${registry} publication through sdk-gen-api ${field} exceeds the 16 KiB field limit`);
    }
}

function assertSafeDirectPublishUrl(value: string): void {
    try {
        const url = new URL(value);
        if (url.protocol === "https:" && url.username.length === 0 && url.password.length === 0) {
            return;
        }
    } catch {
        // Invalid URLs use the same credential-safe diagnostic as other rejected URL forms.
    }
    throw new Error("Direct registry URL must use HTTPS and must not contain user information");
}

function formatKiB(bytes: number): string {
    return `${(bytes / 1024).toFixed(2)} KiB`;
}
