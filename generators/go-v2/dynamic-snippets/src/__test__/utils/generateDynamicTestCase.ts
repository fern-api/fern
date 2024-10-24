import { Audiences } from "@fern-api/configuration";
import { createMockTaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { convertIrToDynamicSnippetsIr } from "@fern-api/dynamic-snippets";
import { IntermediateRepresentation, dynamic as DynamicSnippets } from "@fern-fern/ir-sdk/api";
import { DynamicSnippetsGenerator } from "../../DynamicSnippetsGenerator";
import { buildGeneratorConfig } from "./buildGeneratorConfig";
import { BaseGoCustomConfigSchema } from "@fern-api/go-codegen";

export type DynamicTestCase = {
    ir: IntermediateRepresentation;
    generator: DynamicSnippetsGenerator;
    result: TestResult;
};

export class TestResult {
    public snippets: string[] = [];

    public addSnippet(snippet: string): void {
        this.snippets.push(snippet);
    }

    public toString(): string {
        if (this.snippets.length === 0) {
            return "<none>";
        }
        let s = "";
        this.snippets.forEach((snippet, idx) => {
            if (idx > 0) {
                s += "\n------------------------\n\n";
            }
            s += snippet;
        });
        return s;
    }
}

export async function generateDynamicTestCase({
    workspace,
    audiences,
    customConfig
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    audiences: Audiences;
    customConfig?: Partial<BaseGoCustomConfigSchema>;
}): Promise<DynamicTestCase> {
    const context = createMockTaskContext();
    const fernWorkspace = await workspace.toFernWorkspace({
        context
    });
    const intermediateRepresentation = await generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage: undefined,
        audiences,
        keywords: undefined,
        smartCasing: true,
        disableExamples: false,
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context
    });
    const dynamicIntermediateRepresentation = await convertIrToDynamicSnippetsIr(intermediateRepresentation);
    return {
        ir: intermediateRepresentation,
        generator: new DynamicSnippetsGenerator({
            ir: dynamicIntermediateRepresentation,
            config: buildGeneratorConfig({ customConfig })
        }),
        result: new TestResult()
    };
}
