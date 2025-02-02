import { go } from "@fern-api/go-ast";
import { GoFile } from "@fern-api/go-base";
import { RelativeFilePath } from "@fern-api/path-utils";

import { HttpEndpoint, ServiceId } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

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
        const file = go.file();
        file.add(
            go.func({
                name: "nop",
                parameters: [],
                return_: []
            })
        );
        return new GoFile({
            node: file,
            directory: RelativeFilePath.of("user"),
            filename: "user_test.go",
            packageName: "user_test",
            rootImportPath: "github.com/fern-api/fern-go",
            importPath: "github.com/fern-api/fern-go",
            customConfig: this.context.customConfig
        });
    }
}
