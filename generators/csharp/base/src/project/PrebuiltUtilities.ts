import { readFile } from 'fs/promises'

import { File } from '@fern-api/base-generator'
import { csharp } from '@fern-api/csharp-codegen'
import { AbsoluteFilePath, RelativeFilePath } from '@fern-api/fs-utils'

export class PrebuiltUtilities {
    private utilitiesDirectory = RelativeFilePath.of('Utilities')
    private namespace: string
    private files: File[] = []

    constructor(parentNamespace: string) {
        this.namespace = parentNamespace + '.' + this.utilitiesDirectory
    }

    public addFileToProject(file_: File): void {
        this.files.push(file_)
    }

    public async writeFiles(outputDirectory: AbsoluteFilePath): Promise<void> {
        // Register files from ./
        const asIsFilenames = ['EnumConverter.cs', 'OneOfJsonConverter.cs', 'StringEnum.cs']

        for (const filename of asIsFilenames) {
            const contents = await readFile(filename)
            this.files.push(new File(filename, this.utilitiesDirectory, contents))
        }

        for (const file of this.files) {
            await file.write(outputDirectory)
        }
    }

    // TODO: write json serializers code to the main file
    public enumConverterAnnotation(): csharp.Annotation {
        return csharp.annotation({
            reference: csharp.classReference({
                name: 'JsonConverter',
                namespace: 'System.Text.Json.Serialization'
            }),
            argument: csharp.annotation({
                reference: csharp.classReference({
                    name: 'typeof',
                    namespace: 'System'
                }),
                argument: csharp.classReference({
                    name: 'TolerantEnumConverter',
                    namespace: this.namespace
                })
            })
        })
    }

    public stringEnumConverterAnnotation(): csharp.Annotation {
        return csharp.annotation({
            reference: csharp.classReference({
                name: 'JsonConverter',
                namespace: 'System.Text.Json.Serialization'
            }),
            argument: csharp.annotation({
                reference: csharp.classReference({
                    name: 'typeof',
                    namespace: 'System'
                }),
                argument: csharp.classReference({
                    name: 'StringEnumConverter',
                    namespace: this.namespace
                })
            })
        })
    }

    public oneOfConverterAnnotation(): csharp.Annotation {
        return csharp.annotation({
            reference: csharp.classReference({
                name: 'JsonConverter',
                namespace: 'System.Text.Json.Serialization'
            }),
            argument: csharp.annotation({
                reference: csharp.classReference({
                    name: 'typeof',
                    namespace: 'System'
                }),
                argument: csharp.classReference({
                    name: 'OneOfJsonConverter',
                    namespace: this.namespace
                })
            })
        })
    }

    public stringEnumClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: 'StringEnum',
            namespace: this.namespace
        })
    }
}
