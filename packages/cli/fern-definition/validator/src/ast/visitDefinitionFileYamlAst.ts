import { noop, visitObject } from "@fern-api/core-utils";
import { DefinitionFileSchema } from "@fern-api/fern-definition-schema";

import { DefinitionFileAstVisitor } from "./DefinitionFileAstVisitor.js";
import { visitHttpService } from "./visitors/services/visitHttpService.js";
import { createDocsVisitor } from "./visitors/utils/createDocsVisitor.js";
import { visitErrorDeclarations } from "./visitors/visitErrorDeclarations.js";
import { visitImports } from "./visitors/visitImports.js";
import { visitTypeDeclarations } from "./visitors/visitTypeDeclarations.js";
import { visitWebhooks } from "./visitors/visitWebhooks.js";

export function visitDefinitionFileYamlAst(
    contents: DefinitionFileSchema,
    visitor: Partial<DefinitionFileAstVisitor>
): void {
    visitObject(contents, {
        docs: createDocsVisitor(visitor, []),
        imports: (imports) => {
            visitImports({ imports, visitor, nodePath: ["imports"] });
        },
        types: (types) => {
            visitTypeDeclarations({ typeDeclarations: types, visitor, nodePath: ["types"] });
        },
        service: (service) => {
            if (service != null) {
                visitHttpService({ service, visitor, nodePath: ["service"] });
            }
        },
        webhooks: (webhooks) => {
            for (const [webhookId, webhook] of Object.entries(webhooks ?? {})) {
                visitWebhooks({ webhook, visitor, nodePathForWebhook: ["webhooks", webhookId] });
            }
        },
        // TODO(dsinghvi): Implement visitor for channel
        channel: noop,
        errors: (errors) => {
            visitErrorDeclarations({ errorDeclarations: errors, visitor, nodePath: ["errors"] });
        }
    });
}
