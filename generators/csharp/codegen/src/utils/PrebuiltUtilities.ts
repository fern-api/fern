import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import { Annotation, ClassReference } from "../ast";
import { File } from "../utils/File";

export class PrebuiltUtilities {
    private utilitiesDirectory = RelativeFilePath.of("Utilities");
    private namespace: string;
    private files: File[] = [];

    constructor(parentNamespace: string) {
        this.namespace = parentNamespace + "." + this.utilitiesDirectory;
    }

    public addFileToProject(file_: File): void {
        this.files.push(file_);
    }

    public async writeFiles(outputDirectory: AbsoluteFilePath): Promise<void> {
        // Register files from ./
        const asIsFilenames = ["EnumConverter.cs", "OneOfJsonConverter.cs", "StringEnum.cs"];
        asIsFilenames.forEach(async (filename) => {
            const contents = await readFile(filename);
            this.files.push(new File(filename, this.utilitiesDirectory, contents));
        });

        // Write these and any custom registered files to the output directory
        this.files.forEach((file) => file.write(outputDirectory));
    }

    // TODO: write json serializers code to the main file
    public enumConverterAnnotation(): Annotation {
        return new Annotation({
            reference: new ClassReference({
                name: "JsonConverter",
                namespace: "System.Text.Json.Serialization"
            }),
            argument: new Annotation({
                reference: new ClassReference({
                    name: "typeof",
                    namespace: "System"
                }),
                argument: new ClassReference({
                    name: "TolerantEnumConverter",
                    namespace: this.namespace
                })
            })
        });
    }

    public stringEnumConverterAnnotation(): Annotation {
        return new Annotation({
            reference: new ClassReference({
                name: "JsonConverter",
                namespace: "System.Text.Json.Serialization"
            }),
            argument: new Annotation({
                reference: new ClassReference({
                    name: "typeof",
                    namespace: "System"
                }),
                argument: new ClassReference({
                    name: "StringEnumConverter",
                    namespace: this.namespace
                })
            })
        });
    }

    public oneOfConverterAnnotation(): Annotation {
        return new Annotation({
            reference: new ClassReference({
                name: "JsonConverter",
                namespace: "System.Text.Json.Serialization"
            }),
            argument: new Annotation({
                reference: new ClassReference({
                    name: "typeof",
                    namespace: "System"
                }),
                argument: new ClassReference({
                    name: "OneOfJsonConverter",
                    namespace: this.namespace
                })
            })
        });
    }

    public stringEnumClassReference(): ClassReference {
        return new ClassReference({
            name: "StringEnum",
            namespace: this.namespace
        });
    }
}
