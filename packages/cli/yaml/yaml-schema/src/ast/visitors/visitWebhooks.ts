import { noop, visitObject } from "@fern-api/core-utils";
import { NodePath } from "../../NodePath";
import { HttpHeaderSchema, WebhookPayloadSchema } from "../../schemas";
import { WebhookReferencedPayloadSchema } from "../../schemas/WebhookReferencedPayloadSchema";
import { WebhookSchema } from "../../schemas/WebhookSchema";
import { DefinitionFileAstVisitor, TypeReferenceLocation } from "../DefinitionFileAstVisitor";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { createTypeReferenceVisitor } from "./utils/visitTypeReference";

export async function visitWebhooks({
    webhook,
    visitor,
    nodePathForWebhook
}: {
    webhook: WebhookSchema;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePathForWebhook: NodePath;
}): Promise<void> {
    const visitTypeReference = createTypeReferenceVisitor(visitor);

    await visitObject(webhook, {
        "display-name": noop,
        method: noop,
        examples: noop,
        headers: async (headers) => {
            await visitHeaders({
                headers,
                visitor,
                nodePath: [...nodePathForWebhook, "headers"]
            });
        },
        payload: async (payload) => {
            const nodePathForPayload = [...nodePathForWebhook, "payload"];
            if (typeof payload === "string") {
                await visitTypeReference(payload, nodePathForPayload, {
                    location: "requestReference"
                });
                return;
            }

            if (isRawDiscriminatedUnionDefinition(payload)) {
                await visitTypeReference(payload.type, [...nodePathForPayload, "type"], {
                    location: "requestReference"
                });
                return;
            }

            const nodePathForInlinedPayload = [...nodePathForPayload];
            await visitor.typeDeclaration?.(
                { typeName: { isInlined: true, location: "inlinedRequest" }, declaration: payload },
                nodePathForInlinedPayload
            );
            await visitObject(payload, {
                name: noop,
                extends: async (_extends) => {
                    if (_extends == null) {
                        return;
                    }
                    const extendsList: string[] = typeof _extends === "string" ? [_extends] : _extends;
                    for (const extendedType of extendsList) {
                        const nodePathForExtension = [...nodePathForInlinedPayload, "extends", extendedType];
                        await visitor.extension?.(extendedType, nodePathForExtension);
                        await visitTypeReference(extendedType, nodePathForExtension);
                    }
                },
                properties: async (properties) => {
                    if (properties == null) {
                        return;
                    }
                    for (const [propertyKey, property] of Object.entries(properties)) {
                        const nodePathForProperty = [...nodePathForInlinedPayload, "properties", propertyKey];
                        if (typeof property === "string") {
                            await visitTypeReference(property, nodePathForProperty, {
                                location: TypeReferenceLocation.InlinedRequestProperty
                            });
                        } else {
                            await visitObject(property, {
                                name: noop,
                                docs: createDocsVisitor(visitor, nodePathForProperty),
                                availability: noop,
                                type: async (type) => {
                                    await visitTypeReference(type, [...nodePathForProperty, "type"], {
                                        _default: property.default,
                                        validation: property.validation,
                                        location: TypeReferenceLocation.InlinedRequestProperty
                                    });
                                },
                                audiences: noop,
                                default: noop,
                                validation: noop
                            });
                        }
                    }
                }
            });
        },
        audiences: noop,
        availability: noop,
        docs: createDocsVisitor(visitor, nodePathForWebhook)
    });
}

async function visitHeaders({
    headers,
    visitor,
    nodePath
}: {
    headers: Record<string, HttpHeaderSchema> | undefined;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}) {
    if (headers == null) {
        return;
    }

    const visitTypeReference = createTypeReferenceVisitor(visitor);

    for (const [headerKey, header] of Object.entries(headers)) {
        const nodePathForHeader = [...nodePath, headerKey];

        await visitor.header?.({ headerKey, header }, nodePathForHeader);

        if (typeof header === "string") {
            await visitTypeReference(header, nodePathForHeader);
        } else {
            await visitObject(header, {
                name: noop,
                availability: noop,
                type: async (type) => {
                    await visitTypeReference(type, nodePathForHeader, {
                        _default: header.default,
                        validation: header.validation
                    });
                },
                docs: createDocsVisitor(visitor, nodePathForHeader),
                audiences: noop,
                env: noop,
                default: noop,
                validation: noop
            });
        }
    }
}

export function isRawDiscriminatedUnionDefinition(
    payload: WebhookPayloadSchema
): payload is WebhookReferencedPayloadSchema {
    return (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (payload as WebhookReferencedPayloadSchema).type != null
    );
}
