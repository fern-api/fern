import { OpenAPIWorkspace } from "@fern-api/workspace-loader";
import { Document, RuleDefinition, Spectral } from "@stoplight/spectral-core";
import { Json as JsonParser, Yaml as YamlParser } from "@stoplight/spectral-parsers";
import { getAllRules } from "./rules/getAllRules";
import { RuleViolation, SpectralRule } from "./rules/Rule";

export async function validateOpenAPIWorkspace(workspace: OpenAPIWorkspace): Promise<RuleViolation[]> {
    const rules = getAllRules();
    return await runSpectralRules(rules.spectralRules, workspace);
}

async function runSpectralRules(spectralRules: SpectralRule[], workspace: OpenAPIWorkspace): Promise<RuleViolation[]> {
    const document =
        workspace.definition.format === "json"
            ? new Document(workspace.definition.contents, JsonParser)
            : new Document(workspace.definition.contents, YamlParser);
    const spectral = new Spectral();
    spectral.setRuleset({
        rules: spectralRules.reduce<Record<string, RuleDefinition>>((acc, item) => {
            acc[item.name] = item.get();
            return acc;
        }, {}),
    });
    const violations = await spectral.run(document);
    return violations.map((val) => {
        return {
            severity: "error",
            message: val.message,
            breacrumbs: val.path.map((val) => val.toString()),
        };
    });
}
