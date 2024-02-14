import { noop, visitObject } from "@fern-api/core-utils";
import { DefinitionFileSchema } from "../schemas";
import { DefinitionFileAstVisitor } from "./DefinitionFileAstVisitor";
import { visitHttpService } from "./visitors/services/visitHttpService";
import { createDocsVisitor } from "./visitors/utils/createDocsVisitor";
import { visitErrorDeclarations } from "./visitors/visitErrorDeclarations";
import { visitImports } from "./visitors/visitImports";
import { visitTypeDeclarations } from "./visitors/visitTypeDeclarations";
import { visitWebhooks } from "./visitors/visitWebhooks";

export async function visitDefinitionFileYamlAst(
    contents: DefinitionFileSchema,
    visitor: Partial<DefinitionFileAstVisitor>
): Promise<void> {
    await visitObject(contents, {
        docs: createDocsVisitor(visitor, []),
        imports: async (imports) => {
            await visitImports({ imports, visitor, nodePath: ["imports"] });
        },
        types: async (types) => {
            await visitTypeDeclarations({ typeDeclarations: types, visitor, nodePath: ["types"] });
        },
        service: async (service) => {
            if (service != null) {
                await visitHttpService({ service, visitor, nodePath: ["service"] });
            }
        },
        webhooks: async (webhooks) => {
            for (const [webhookId, webhook] of Object.entries(webhooks ?? {})) {
                await visitWebhooks({ webhook, visitor, nodePathForWebhook: ["webhooks", webhookId] });
            }
        },
        // TODO(dsinghvi): Implement visitor for channel
        channel: noop,
        errors: async (errors) => {
            await visitErrorDeclarations({ errorDeclarations: errors, visitor, nodePath: ["errors"] });
        }
    });
}
