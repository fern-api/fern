import { assertNever } from "@fern-api/core-utils";
import type { ApiSpecFormat, Detection, Recommendation, RecommendationId } from "./types";

const LINKS: Record<RecommendationId, string> = {
    sdks: "https://buildwithfern.com/learn/sdks/overview/introduction",
    docs: "https://buildwithfern.com/learn/docs/getting-started/overview",
    "docs-mcp": "https://buildwithfern.com/learn/docs/ai-features/mcp-server",
    "agent-mcp": "https://buildwithfern.com/learn/docs/ai-features/fern-mcp-servers",
    "spec-from-framework": "https://buildwithfern.com/learn/api-definitions/openapi/overview",
    "docs-migration": "https://buildwithfern.com/learn/docs/getting-started/overview",
    cli: "https://buildwithfern.com/learn/cli-generator/get-started/quickstart"
};

export function recommend(detection: Detection): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const spec = detection.apiSpecs[0];
    if (spec !== undefined) {
        const evidence = `${spec.path} (${formatLabel(spec.format)}${spec.version === undefined ? "" : ` ${spec.version}`})`;
        recommendations.push(
            { id: "sdks", title: "SDK generation", why: `Found ${evidence}`, link: LINKS.sdks },
            { id: "docs", title: "API documentation", why: `Build docs from ${spec.path}`, link: LINKS.docs },
            {
                id: "docs-mcp",
                title: "Customer-facing docs MCP",
                why: `Make your API documentation from ${spec.path} available to AI clients`,
                link: LINKS["docs-mcp"]
            },
            {
                id: "cli",
                title: "CLI generator",
                why: `Generate a command-line tool for your API from ${spec.path}`,
                link: LINKS.cli
            }
        );
    } else {
        const framework = detection.frameworks.find((candidate) => candidate.canGenerateOpenApi);
        if (framework !== undefined) {
            recommendations.push({
                id: "spec-from-framework",
                title: "OpenAPI spec from your framework",
                why: `Found ${framework.name}; export an OpenAPI spec before generating SDKs`,
                link: LINKS["spec-from-framework"]
            });
        }
        const nonOpenApiSpec = detection.apiSpecs.find((candidate) => candidate.format !== "openapi");
        if (nonOpenApiSpec !== undefined) {
            recommendations.push({
                id: "docs",
                title: "API documentation",
                why: `Found ${formatLabel(nonOpenApiSpec.format)} definition at ${nonOpenApiSpec.path}`,
                link: LINKS.docs
            });
        }
    }
    if (!recommendations.some((recommendation) => recommendation.id === "docs")) {
        recommendations.push({
            id: "docs",
            title: "API documentation",
            why: "Fern can turn an API definition into a searchable documentation site",
            link: LINKS.docs
        });
    }
    if (detection.apiSpecs.length > 0 && !recommendations.some((recommendation) => recommendation.id === "docs-mcp")) {
        recommendations.push({
            id: "docs-mcp",
            title: "Customer-facing docs MCP",
            why: "Expose your documentation to AI clients",
            link: LINKS["docs-mcp"]
        });
    }
    if (detection.agents.length > 0) {
        recommendations.push({
            id: "agent-mcp",
            title: "Fern MCP for coding agents",
            why: `Detected ${detection.agents.join(", ")} configuration`,
            link: LINKS["agent-mcp"]
        });
    }
    if (detection.docsTools.some((tool) => tool.name === "mintlify")) {
        const mintlify = detection.docsTools.find((tool) => tool.name === "mintlify");
        recommendations.push({
            id: "docs-migration",
            title: "Migrate from Mintlify",
            why: `Found Mintlify configuration at ${mintlify?.path ?? "mint.json"}`,
            link: LINKS["docs-migration"]
        });
    }
    return recommendations;
}

function formatLabel(format: ApiSpecFormat): string {
    switch (format) {
        case "openapi":
            return "OpenAPI";
        case "asyncapi":
            return "AsyncAPI";
        case "protobuf":
            return "protobuf";
        default:
            return assertNever(format);
    }
}

export function getRecommendationLink(id: RecommendationId): string {
    return LINKS[id];
}
