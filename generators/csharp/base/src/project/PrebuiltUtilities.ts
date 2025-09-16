import { File } from "@fern-api/base-generator";
import { ast, CSharp } from "@fern-api/csharp-codegen";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

export class PrebuiltUtilities {
    private utilitiesDirectory = RelativeFilePath.of("Utilities");
    private namespace: string;
    private files: File[] = [];

    constructor(
        parentNamespace: string,
        private csharp: CSharp
    ) {
        this.namespace = parentNamespace + "." + this.utilitiesDirectory;
    }

    public addFileToProject(file_: File): void {
        this.files.push(file_);
    }

    public async writeFiles(outputDirectory: AbsoluteFilePath): Promise<void> {
        // Register files from ./
        const asIsFilenames = ["EnumConverter.cs", "OneOfJsonConverter.cs", "StringEnum.cs"];

        for (const filename of asIsFilenames) {
            const contents = await readFile(filename);
            this.files.push(new File(filename, this.utilitiesDirectory, contents));
        }

        for (const file of this.files) {
            await file.write(outputDirectory);
        }
    }

    // TODO: write json serializers code to the main file
    public enumConverterAnnotation(): ast.Annotation {
        return this.csharp.annotation({
            reference: this.csharp.System.Text.Json.Serialization.JsonConverter(),
            argument: this.csharp.annotation({
                reference: this.csharp.classReference({
                    name: "typeof",
                    namespace: "System"
                }),
                argument: this.csharp.classReference({
                    name: "TolerantEnumConverter",
                    namespace: this.namespace
                })
            })
        });
    }

    public stringEnumConverterAnnotation(): ast.Annotation {
        return this.csharp.annotation({
            reference: this.csharp.System.Text.Json.Serialization.JsonConverter(),
            argument: this.csharp.annotation({
                reference: this.csharp.classReference({
                    name: "typeof",
                    namespace: "System"
                }),
                argument: this.csharp.classReference({
                    name: "StringEnumConverter",
                    namespace: this.namespace
                })
            })
        });
    }

    public oneOfConverterAnnotation(): ast.Annotation {
        return this.csharp.annotation({
            reference: this.csharp.System.Text.Json.Serialization.JsonConverter(),
            argument: this.csharp.annotation({
                reference: this.csharp.classReference({
                    name: "typeof",
                    namespace: "System"
                }),
                argument: this.csharp.classReference({
                    name: "OneOfJsonConverter",
                    namespace: this.namespace
                })
            })
        });
    }

    public stringEnumClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: "StringEnum",
            namespace: this.namespace
        });
    }
}
