import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { SdkGeneratorContext } from "../../../SdkGeneratorContext";
import { RootClientGenerator } from "../../client";

export class SnippetJsonGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly rootClientGenerator: RootClientGenerator;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context;
        this.rootClientGenerator = new RootClientGenerator({
            clientName: context.project.symbolRegistry.getRootClientSymbolOrThrow(),
            package_: context.ir.rootPackage,
            sdkGeneratorContext: context
        });
    }

    public async generate(): Promise<FernGeneratorExec.Snippets> {
        // TODO(kafkas): Implement
        return {
            types: {},
            endpoints: [
                {
                    id: {
                        method: "POST",
                        path: FernGeneratorExec.EndpointPath("/users/activate"),
                        identifierOverride: "endpoint1"
                    },
                    snippet: {
                        type: "typescript",
                        client: "some code content for snippet",
                        _visit: (res) => {
                            return res.typescript({ client: "ts some code content for snippet" });
                        }
                    },
                    exampleIdentifier: "abc123"
                }
            ]
        };
    }
}
