import { HttpEndpoint, ServiceId } from "@fern-fern/ir-sdk/api";
import { GoFile } from "@fern-api/go-base";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { go } from "@fern-api/go-ast";
import { RelativeFilePath } from "@fern-api/path-utils";

export class WireTestGenerator {
    private readonly context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public generate({ serviceId, endpoints }: { serviceId: ServiceId; endpoints: HttpEndpoint[] }): GoFile {
        // TODO: Filter out all of the non-JSON endpoints.
        // TODO: Map the endpoint's full path to the dynamic IR representation (e.g. POST /users).
        // TODO: Map the example into the dynamic IR payload (similar to the test suite generator).
        // TODO: Include every test case as a separate item in the table-driven tests.
        console.log(`TODO: Generate test cases for service ${serviceId}, endpoints: ${endpoints}`);
        const file = go.file();
        return new GoFile({
            node: file,
            directory: RelativeFilePath.of("TODO"),
            filename: "TODO_test.go",
            packageName: "TODO_test",
            rootImportPath: "TODO",
            importPath: "TODO",
            customConfig: this.context.customConfig,
        });
    }
}