import { noop } from "@fern-api/core-utils";
import { DocsDefinitionResolver } from "@fern-api/docs-resolver";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";

import { Rule } from "../../Rule.js";
import { buildSlugCollisionViolations } from "./build-violations.js";

const NOOP_CONTEXT = createMockTaskContext({ logger: createLogger(noop) });

export const NoSlugCollisionsRule: Rule = {
    name: "no-slug-collisions",
    create: async ({ workspace, apiWorkspaces, ossWorkspaces }) => {
        const instanceUrls: string[] = [];
        workspace.config.instances.forEach((instance) => {
            instanceUrls.push(instance.url);
            if (typeof instance.customDomain === "string") {
                instanceUrls.push(instance.customDomain);
            } else if (Array.isArray(instance.customDomain)) {
                instanceUrls.push(...instance.customDomain);
            }
        });

        const url = instanceUrls[0] ?? "http://localhost";

        const docsDefinitionResolver = new DocsDefinitionResolver({
            domain: url,
            docsWorkspace: workspace,
            ossWorkspaces,
            apiWorkspaces,
            taskContext: NOOP_CONTEXT,
            editThisPage: undefined,
            uploadFiles: undefined,
            registerApi: undefined,
            targetAudiences: undefined
        });

        const resolvedDocsDefinition = await docsDefinitionResolver.resolve();

        if (!resolvedDocsDefinition.config.root) {
            return {};
        }

        const root = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(resolvedDocsDefinition.config.root);
        const collector = FernNavigation.NodeCollector.collect(root);
        const violations = buildSlugCollisionViolations(collector);

        return {
            file: () => violations
        };
    }
};
