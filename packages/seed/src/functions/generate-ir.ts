// import { Workspace, FernDefinition, 
import { WorkspaceLoader, loadWorkspace } from "@fern-api/workspace-loader";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import path from "path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { fixtureChoices, IntermediateRepOrNull } from "../cli";
import { migrateIntermediateRepresentationThroughVersion } from "@fern-api/ir-migrations";

export async function generateIR (irVersion : string, language : string, fixture : string) : Promise<IntermediateRepOrNull | IntermediateRepOrNull[]>
{
    process.stdout.write(language+"\n"); //can delete after we figure out generateIntermediateRepresentation parameter
    if(fixtureChoices.includes(fixture))
    {
        const workspacePath : AbsoluteFilePath = AbsoluteFilePath.of(path.join(__dirname, "fern", fixture));
        const ir : IntermediateRepOrNull = await checkAndReturnIR(workspacePath, irVersion);
        return ir;
    }
    else
    {
        const ir_array : IntermediateRepOrNull[] = [];
        const workspacePaths : AbsoluteFilePath[] = fixtureChoices.map((choice) => AbsoluteFilePath.of(path.join(__dirname, "fern", choice)));
        workspacePaths.forEach(async (path) => {
            const ir : IntermediateRepOrNull = await checkAndReturnIR(path, irVersion);
            ir_array.push(ir);
        });
        return ir_array;
    }
}

async function checkAndReturnIR(workspacePath : AbsoluteFilePath, irVersion: string) : Promise<IntermediateRepOrNull>
{
    const workspace : WorkspaceLoader.Result = await loadWorkspace({ absolutePathToWorkspace : workspacePath, context: createMockTaskContext(), cliVersion: irVersion});
    if(workspace.didSucceed && workspace.workspace.type === "fern")
    {
        const intermediateRep = await generateIntermediateRepresentation({ workspace: workspace.workspace, generationLanguage: "java", audiences: { type: "all"} });
        //not sure what the best way to pass the language param from CLI input since I can't pass the 'language' param directly to an enum 
        if(irVersion !== "latest")
        {
            const migratedIR = await migrateIntermediateRepresentationThroughVersion({intermediateRepresentation: intermediateRep, context: createMockTaskContext(), version: irVersion});
            if(migratedIR != null)
            {
                process.stdout.write(""); //not sure how to type migrateIR or anything so that we can return it, since the function returns an unknown... just remove all types?
            }
        }
        return intermediateRep;
    }
    return null; //not sure if you want to return null or smth else 
}