import { TaskContext } from "@fern-api/task-context";
import { Document, RuleDefinition, Spectral } from "@stoplight/spectral-core";
import { Json as JsonParser, Yaml as YamlParser } from "@stoplight/spectral-parsers";
import { OpenAPIV3 } from "openapi-types";
import { getAllRules } from "./rules/getAllRules";
import { RuleViolation, SpectralRule } from "./rules/Rule";

export interface LintArgs {
    context: TaskContext;
    document: OpenAPIV3.Document;
    rawContents: string;
    format: "yaml" | "json";
}

export async function lint(args: LintArgs): Promise<RuleViolation[]> {
    const rules = getAllRules();
    return await runSpectralRules(rules.spectralRules, args);
}

async function runSpectralRules(spectralRules: SpectralRule[], args: LintArgs): Promise<RuleViolation[]> {
    const document =
        args.format === "json"
            ? new Document(args.rawContents, JsonParser)
            : new Document(args.rawContents, YamlParser);
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
