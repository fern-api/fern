import { replaceEnvVariables } from "@fern-api/core-utils";
import type { FernSdkGenApiPublishCredentialSource } from "@fern-api/remote-workspace-runner/direct-publish-credentials";

interface CredentialFields {
    token?: unknown;
    username?: unknown;
    password?: unknown;
    signature?: unknown;
}

export function sanitizeSdkConfigPublishCredentials(
    input: unknown,
    isPreview: boolean
): {
    sanitizedInput: unknown;
    credentials: Array<FernSdkGenApiPublishCredentialSource | undefined>;
} {
    if (!isRecord(input) || !Array.isArray(input.targets)) {
        return { sanitizedInput: input, credentials: [] };
    }
    const rootOutput = sanitizeOutput(input.output);
    const sanitizedTargets = input.targets.map((target) => {
        if (!isRecord(target)) {
            return { target, credential: undefined };
        }
        const sanitized = sanitizeOutput(target.output);
        const targetOutput = isRecord(target) ? target.output : undefined;
        const output = targetOutput ?? input.output;
        return {
            target: sanitized.output === target.output ? target : { ...target, output: sanitized.output },
            credential: isPreview ? undefined : extractPublishCredential(output)
        };
    });
    return {
        sanitizedInput: {
            ...input,
            ...(rootOutput.output === input.output ? {} : { output: rootOutput.output }),
            targets: sanitizedTargets.map(({ target }) => target)
        },
        credentials: sanitizedTargets.map(({ credential }) => credential)
    };
}

function sanitizeOutput(value: unknown): { output: unknown } {
    if (!isRecord(value) || !isRecord(value.publish)) {
        return { output: value };
    }
    const publish = value.publish;
    const registry = publish.registry;
    if (registry !== "npm" && registry !== "crates" && registry !== "pypi" && registry !== "maven") {
        const {
            credentials: _credentials,
            token: _token,
            username: _username,
            password: _password,
            apiKey: _apiKey,
            signature: _signature,
            keyId: _keyId,
            secretKey: _secretKey,
            ...intent
        } = publish;
        return { output: { ...value, publish: intent } };
    }
    const {
        credentials: _credentials,
        token: _token,
        username: _username,
        password: _password,
        signature: _signature,
        ...intent
    } = publish;
    validateCredentialFieldShape(registry, publish, credentialFields(publish));
    return { output: { ...value, publish: intent } };
}

function extractPublishCredential(output: unknown): FernSdkGenApiPublishCredentialSource | undefined {
    if (
        !isRecord(output) ||
        (output.delivery !== "files" && output.delivery !== "zip" && output.delivery !== "github") ||
        !isRecord(output.publish)
    ) {
        return undefined;
    }
    const publish = output.publish;
    if (output.delivery === "github" && !hasPublishCredentialFields(publish)) {
        return undefined;
    }
    const fields = credentialFields(publish);
    const registry = publish.registry;
    if (typeof registry !== "string") {
        return undefined;
    }
    if (registry === "npm" || registry === "crates") {
        return { registry, token: credentialValue(registry, "token", fields.token) };
    }
    if (registry === "pypi") {
        return {
            registry,
            username: credentialValue(registry, "username", fields.username),
            password: credentialValue(registry, "password", fields.password)
        };
    }
    if (registry === "maven") {
        const signature = fields.signature;
        if (signature != null && !isRecord(signature)) {
            throw new Error("Direct maven publication signature must be an object");
        }
        return {
            registry,
            username: credentialValue(registry, "username", fields.username),
            password: credentialValue(registry, "password", fields.password),
            ...(signature == null
                ? {}
                : {
                      signature: {
                          keyId: credentialValue(registry, "signature.keyId", signature.keyId),
                          password: credentialValue(registry, "signature.password", signature.password),
                          secretKey: credentialValue(registry, "signature.secretKey", signature.secretKey)
                      }
                  })
        };
    }
    switch (registry) {
        case "nuget":
        case "rubygems":
        case "go":
        case "composer":
        case "postman":
            return { registry };
        default:
            return undefined;
    }
}

function hasPublishCredentialFields(publish: Record<string, unknown>): boolean {
    return (
        publish.credentials != null ||
        publish.token != null ||
        publish.username != null ||
        publish.password != null ||
        publish.apiKey != null ||
        publish.signature != null ||
        publish.keyId != null ||
        publish.secretKey != null
    );
}

export function resolveSdkConfigPublishCredential(
    credential: FernSdkGenApiPublishCredentialSource
): FernSdkGenApiPublishCredentialSource {
    switch (credential.registry) {
        case "npm":
        case "crates":
            return {
                registry: credential.registry,
                token: resolveCredentialValue(credential.registry, "token", credential.token)
            };
        case "pypi":
            return {
                registry: credential.registry,
                username: resolveCredentialValue(credential.registry, "username", credential.username),
                password: resolveCredentialValue(credential.registry, "password", credential.password)
            };
        case "maven":
            return {
                registry: credential.registry,
                username: resolveCredentialValue(credential.registry, "username", credential.username),
                password: resolveCredentialValue(credential.registry, "password", credential.password),
                ...(credential.signature == null
                    ? {}
                    : {
                          signature: {
                              keyId: resolveCredentialValue(
                                  credential.registry,
                                  "signature.keyId",
                                  credential.signature.keyId
                              ),
                              password: resolveCredentialValue(
                                  credential.registry,
                                  "signature.password",
                                  credential.signature.password
                              ),
                              secretKey: resolveCredentialValue(
                                  credential.registry,
                                  "signature.secretKey",
                                  credential.signature.secretKey
                              )
                          }
                      })
            };
        default:
            return credential;
    }
}

function credentialValue(registry: string, field: string, value: unknown): string | undefined {
    if (value == null) {
        return undefined;
    }
    if (typeof value !== "string") {
        throw new Error(`Direct ${registry} publication credential ${field} must be a string`);
    }
    return value;
}

function resolveCredentialValue(registry: string, field: string, value: string | undefined): string | undefined {
    if (value == null) {
        return undefined;
    }
    return replaceEnvVariables(value, {
        onError: (message) => {
            throw new Error(message ?? `Could not resolve direct ${registry} publication credential ${field}`);
        }
    });
}

function credentialFields(publish: Record<string, unknown>): CredentialFields {
    const nested = isRecord(publish.credentials) ? publish.credentials : {};
    return {
        token: publish.token ?? nested.token,
        username: publish.username ?? nested.username,
        password: publish.password ?? nested.password,
        signature: publish.signature
    };
}

function validateCredentialFieldShape(
    registry: string,
    publish: CredentialFields & Record<string, unknown>,
    fields: CredentialFields
): void {
    if (publish.credentials != null && !isRecord(publish.credentials)) {
        throw new Error(`Direct ${registry} publication credentials must be an object`);
    }
    const allowed =
        registry === "npm" || registry === "crates"
            ? new Set(["registry", "url", "releaseBranch", "tolerateRepublish", "credentials", "token"])
            : registry === "pypi"
              ? new Set([
                    "registry",
                    "url",
                    "releaseBranch",
                    "tolerateRepublish",
                    "credentials",
                    "username",
                    "password"
                ])
              : new Set([
                    "registry",
                    "url",
                    "releaseBranch",
                    "tolerateRepublish",
                    "credentials",
                    "username",
                    "password",
                    "signature"
                ]);
    const unknown = Object.keys(publish).find((key) => !allowed.has(key));
    if (unknown != null) {
        throw new Error(`Direct ${registry} publication does not support option ${unknown}`);
    }
    const allowedCredentialFields =
        registry === "npm" || registry === "crates" ? new Set(["token"]) : new Set(["username", "password"]);
    const unknownNested = isRecord(publish.credentials)
        ? Object.keys(publish.credentials).find((key) => !allowedCredentialFields.has(key))
        : undefined;
    if (unknownNested != null) {
        throw new Error(`Direct ${registry} publication does not support credential field ${unknownNested}`);
    }
    const credentialValues: Array<[string, unknown]> =
        registry === "npm" || registry === "crates"
            ? [["token", fields.token]]
            : [
                  ["username", fields.username],
                  ["password", fields.password]
              ];
    for (const [field, value] of credentialValues) {
        if (value != null && typeof value !== "string") {
            throw new Error(`Direct ${registry} publication credential ${field} must be a string`);
        }
    }
    if (registry === "maven" && fields.signature != null) {
        if (!isRecord(fields.signature)) {
            throw new Error("Direct maven publication signature must be an object");
        }
        const unknownSignatureField = Object.keys(fields.signature).find(
            (key) => key !== "keyId" && key !== "password" && key !== "secretKey"
        );
        if (unknownSignatureField != null) {
            throw new Error(`Direct maven publication does not support signature field ${unknownSignatureField}`);
        }
        for (const field of ["keyId", "password", "secretKey"]) {
            const value = fields.signature[field];
            if (value != null && typeof value !== "string") {
                throw new Error(`Direct maven publication credential signature.${field} must be a string`);
            }
        }
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}
