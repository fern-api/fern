import { noop, visitObject } from "@fern-api/core-utils";
import { HttpHeaderSchema } from "../../schemas";
import { WebhookSchema } from "../../schemas/WebhookSchema";
import { isInlineRequestBody } from "../../utils/isInlineRequestBody";
import { DefinitionFileAstVisitor, TypeReferenceLocation } from "../DefinitionFileAstVisitor";
import { NodePath } from "../NodePath";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { createTypeReferenceVisitor } from "./utils/visitTypeReference";

export async function visitWebhooks({
    webhook,
    visitor,
    nodePathForWebhook,
}: {
    webhook: WebhookSchema;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePathForWebhook: NodePath;
}): Promise<void> {
    const visitTypeReference = createTypeReferenceVisitor(visitor);

    await visitObject(webhook, {
        "display-name": noop,
        path: noop,
        method: noop,
        payload: async (payload) => {
            if (payload == null) {
                return;
            }
            const nodePathForPayload = [...nodePathForWebhook, "payload"];
            if (typeof payload === "string") {
                await visitTypeReference(payload, nodePathForPayload, {
                    location: "requestReference",
                });
                return;
            }
            await visitObject(payload, {
                name: noop,
                headers: async (headers) => {
                    await visitHeaders({
                        headers,
                        visitor,
                        nodePath: [...nodePathForPayload, "headers"],
                    });
                },
                body: async (body) => {
                    if (body == null) {
                        return;
                    }
                    const nodePathForRequestBody = [...nodePathForPayload, "body"];
                    if (typeof body === "string") {
                        await visitTypeReference(body, nodePathForRequestBody, {
                            location: "requestReference",
                        });
                    } else if (isInlineRequestBody(body)) {
                        await visitor.typeDeclaration?.(
                            { typeName: { isInlined: true, location: "inlinedRequest" }, declaration: body },
                            nodePathForRequestBody
                        );
                        await visitObject(body, {
                            extends: async (_extends) => {
                                if (_extends == null) {
                                    return;
                                }
                                const extendsList: string[] = typeof _extends === "string" ? [_extends] : _extends;
                                for (const extendedType of extendsList) {
                                    const nodePathForExtension = [...nodePathForRequestBody, "extends", extendedType];
                                    await visitor.extension?.(extendedType, nodePathForExtension);
                                    await visitTypeReference(extendedType, nodePathForExtension);
                                }
                            },
                            properties: async (properties) => {
                                if (properties == null) {
                                    return;
                                }
                                for (const [propertyKey, property] of Object.entries(properties)) {
                                    const nodePathForProperty = [...nodePathForRequestBody, "properties", propertyKey];
                                    if (typeof property === "string") {
                                        await visitTypeReference(property, nodePathForProperty, {
                                            location: TypeReferenceLocation.InlinedRequestProperty,
                                        });
                                    } else {
                                        await visitObject(property, {
                                            name: noop,
                                            docs: createDocsVisitor(visitor, nodePathForProperty),
                                            availability: noop,
                                            type: async (type) => {
                                                await visitTypeReference(type, [...nodePathForProperty, "type"], {
                                                    location: TypeReferenceLocation.InlinedRequestProperty,
                                                });
                                            },
                                            audiences: noop,
                                        });
                                    }
                                }
                            },
                        });
                    } else {
                        await createDocsVisitor(visitor, nodePathForRequestBody)(body.docs);
                        await visitTypeReference(body.type, nodePathForRequestBody);
                    }
                },
            });
        },
        audiences: noop,
        availability: noop,
        docs: createDocsVisitor(visitor, nodePathForWebhook),
    });
}

async function visitHeaders({
    headers,
    visitor,
    nodePath,
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
                    await visitTypeReference(type, nodePathForHeader);
                },
                docs: createDocsVisitor(visitor, nodePathForHeader),
                audiences: noop,
            });
        }
    }
}
