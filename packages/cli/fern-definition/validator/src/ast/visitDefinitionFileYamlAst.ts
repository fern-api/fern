import { noop, visitObject } from "@fern-api/core-utils";
import { DefinitionFileSchema } from "@fern-api/fern-definition-schema";

import { DefinitionFileAstVisitor } from "./DefinitionFileAstVisitor";
import { visitHttpService } from "./visitors/services/visitHttpService";
import { createDocsVisitor } from "./visitors/utils/createDocsVisitor";
import { visitErrorDeclarations } from "./visitors/visitErrorDeclarations";
import { visitImports } from "./visitors/visitImports";
import { visitTypeDeclarations } from "./visitors/visitTypeDeclarations";
import { visitWebhooks } from "./visitors/visitWebhooks";

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
