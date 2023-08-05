import { createMockTaskContext } from "@fern-api/task-context";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";

export async function generateIR () : Promise<void>
{
    const workspace : = await loadWorkspace();
    process.stdout.write("Hello World");
}