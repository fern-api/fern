import { noop, visitObject } from "@fern-api/core-utils";
import { NodePath, RawSchemas } from "@fern-api/fern-definition-schema";

import { DefinitionFileAstVisitor, TypeReferenceLocation } from "../DefinitionFileAstVisitor";
import { createDocsVisitor } from "./utils/createDocsVisitor";
import { createTypeReferenceVisitor } from "./utils/visitTypeReference";

export function visitWebhooks({
    webhook,
    visitor,
    nodePathForWebhook
}: {
    webhook: RawSchemas.WebhookSchema;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePathForWebhook: NodePath;
}): void {
    const visitTypeReference = createTypeReferenceVisitor(visitor);

    visitObject(webhook, {
        "display-name": noop,
        method: noop,
        examples: noop,
        headers: (headers) => {
            visitHeaders({
                headers,
                visitor,
                nodePath: [...nodePathForWebhook, "headers"]
            });
        },
        payload: (payload) => {
            const nodePathForPayload = [...nodePathForWebhook, "payload"];
            if (typeof payload === "string") {
                visitTypeReference(payload, nodePathForPayload, {
                    location: "requestReference"
                });
                return;
            }

            if (isRawDiscriminatedUnionDefinition(payload)) {
                visitTypeReference(payload.type, [...nodePathForPayload, "type"], {
                    location: "requestReference"
                });
                return;
            }

            const nodePathForInlinedPayload = [...nodePathForPayload];
            visitor.typeDeclaration?.(
                { typeName: { isInlined: true, location: "inlinedRequest" }, declaration: payload },
                nodePathForInlinedPayload
            );
            visitObject(payload, {
                name: noop,
                extends: (_extends) => {
                    if (_extends == null) {
                        return;
                    }
                    const extendsList: string[] = typeof _extends === "string" ? [_extends] : _extends;
                    for (const extendedType of extendsList) {
                        const nodePathForExtension = [...nodePathForInlinedPayload, "extends", extendedType];
                        visitor.extension?.(extendedType, nodePathForExtension);
                        visitTypeReference(extendedType, nodePathForExtension);
                    }
                },
                properties: (properties) => {
                    if (properties == null) {
                        return;
                    }
                    for (const [propertyKey, property] of Object.entries(properties)) {
                        const nodePathForProperty = [...nodePathForInlinedPayload, "properties", propertyKey];
                        if (typeof property === "string") {
                            visitTypeReference(property, nodePathForProperty, {
                                location: TypeReferenceLocation.InlinedRequestProperty
                            });
                        } else {
                            visitObject(property, {
                                name: noop,
                                docs: createDocsVisitor(visitor, nodePathForProperty),
                                availability: noop,
                                type: (type) => {
                                    visitTypeReference(type, [...nodePathForProperty, "type"], {
                                        _default: property.default,
                                        validation: property.validation,
                                        location: TypeReferenceLocation.InlinedRequestProperty
                                    });
                                },
                                audiences: noop,
                                encoding: noop,
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

function visitHeaders({
    headers,
    visitor,
    nodePath
}: {
    headers: Record<string, RawSchemas.HttpHeaderSchema> | undefined;
    visitor: Partial<DefinitionFileAstVisitor>;
    nodePath: NodePath;
}) {
    if (headers == null) {
        return;
    }

    const visitTypeReference = createTypeReferenceVisitor(visitor);

    for (const [headerKey, header] of Object.entries(headers)) {
        const nodePathForHeader = [...nodePath, headerKey];

        visitor.header?.({ headerKey, header }, nodePathForHeader);

        if (typeof header === "string") {
            visitTypeReference(header, nodePathForHeader);
        } else {
            visitObject(header, {
                name: noop,
                availability: noop,
                type: (type) => {
                    visitTypeReference(type, nodePathForHeader, {
                        _default: header.default,
                        validation: header.validation
                    });
                },
                docs: createDocsVisitor(visitor, nodePathForHeader),
                audiences: noop,
                encoding: noop,
                env: noop,
                default: noop,
                validation: noop
            });
        }
    }
}

export function isRawDiscriminatedUnionDefinition(
    payload: RawSchemas.WebhookPayloadSchema
): payload is RawSchemas.WebhookReferencedPayloadSchema {
    return (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (payload as RawSchemas.WebhookReferencedPayloadSchema).type != null
    );
}
