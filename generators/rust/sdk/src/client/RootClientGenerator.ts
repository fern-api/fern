import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { Package, Subpackage } from "@fern-fern/ir-sdk/api";

export class RootClientGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly package: Package;
    private readonly projectName: string;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
        this.package = context.ir.rootPackage;
        this.projectName = context.ir.apiName.pascalCase.safeName;
    }

    public generate(): RustFile {
        const subpackages = this.getSubpackages();
        const clientName = this.getRootClientName();

        // Simple client generation - no bloat!
        const rustRootClient = rust.client({
            name: clientName,
            isRoot: true,
            subClients: subpackages.map(subpackage => this.getSubClientName(subpackage))
        });

        const fileContents = rustRootClient.toString();
        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of("src/client"),
            fileContents
        });
    }



    private getSubpackages(): Subpackage[] {
        return this.package.subpackages
            .map(subpackageId => this.context.getSubpackageOrThrow(subpackageId))
            .filter(subpackage => subpackage.service != null || subpackage.hasEndpointsInTree);
    }

    private getSubClientName(subpackage: Subpackage): string {
        return `${subpackage.name.pascalCase.safeName}Client`;
    }



    private getRootClientName(): string {
        return this.context.getClientName();
    }
} 