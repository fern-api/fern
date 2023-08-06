import { WorkspaceLoader, loadWorkspace } from "@fern-api/workspace-loader";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import path from "path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { fixtureChoices } from "../cli";
import { migrateIntermediateRepresentationThroughVersion } from "@fern-api/ir-migrations";

export async function generateIR (irVersion : string, language : string, fixture : string) : Promise<unknown>
{
    process.stdout.write(language+"\n"); //can delete after we figure out generateIntermediateRepresentation parameter
    if(fixtureChoices.includes(fixture))
    {
        const workspacePath : AbsoluteFilePath = AbsoluteFilePath.of(path.join(__dirname, "fern", fixture));
        const ir = await checkAndReturnIR(workspacePath, irVersion);
        return ir;
    }
    else
    {
        const workspacePaths : AbsoluteFilePath[] = fixtureChoices.map((choice) => AbsoluteFilePath.of(path.join(__dirname, "fern", choice)));
        const ir_array : unknown[] = await Promise.all(workspacePaths.map(async (path) => {
            const ir  = await checkAndReturnIR(path, irVersion);
            return ir;
        }));
        return ir_array;
    }
}

async function checkAndReturnIR(workspacePath : AbsoluteFilePath, irVersion: string)
{
    const workspace : WorkspaceLoader.Result = await loadWorkspace({ absolutePathToWorkspace : workspacePath, context: createMockTaskContext(), cliVersion: irVersion});
    if(workspace.didSucceed && workspace.workspace.type === "fern")
    {
        const intermediateRep = await generateIntermediateRepresentation({ workspace: workspace.workspace, generationLanguage: "java", audiences: { type: "all"} });
        //not sure what the best way to pass the language param from CLI input since I can't pass the 'language' param directly to an enum 
        if(irVersion !== "latest")
        {
            const migratedIR = await migrateIntermediateRepresentationThroughVersion({intermediateRepresentation: intermediateRep, context: createMockTaskContext(), version: irVersion});
            return migratedIR;
        }
        return intermediateRep;
    }
    return null; //not sure if you want to return null or smth else if the workspace type is not fern
}