import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { MultiUrlEnvironmentGenerator } from "./MultiUrlEnvironmentGenerator";
import { SingleUrlEnvironmentGenerator } from "./SingleUrlEnvironmentGenerator";

export class EnvironmentGenerator {
    private context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public generate(): void {
        return this.context.ir.environments?.environments._visit({
            singleBaseUrl: (value) => {
                const environments = new SingleUrlEnvironmentGenerator({
                    context: this.context,
                    singleUrlEnvironments: value
                });
                this.context.project.addSourceFiles(environments.generate());
            },
            multipleBaseUrls: (value) => {
                const environments = new MultiUrlEnvironmentGenerator({
                    context: this.context,
                    multiUrlEnvironments: value
                });
                this.context.project.addSourceFiles(environments.generate());
            },
            _other: () => undefined
        });
    }
}
