import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { convert, getConvertOptions } from "@fern-api/openapi-ir-to-fern";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { mapValues } from "lodash-es";

import { FernDefinition } from "..";
import { BaseOpenAPIWorkspace } from "./BaseOpenAPIWorkspace";

export class FernDefinitionConverter {
    constructor(private readonly args: BaseOpenAPIWorkspace.Args) {}

    public convert({
        context,
        ir,
        settings,
        absoluteFilePath
    }: {
        context: TaskContext;
        ir: OpenApiIntermediateRepresentation;
        settings?: BaseOpenAPIWorkspace.Settings;
        absoluteFilePath?: AbsoluteFilePath;
    }): FernDefinition {
        const definition = convert({
            taskContext: context,
            ir,
            options: getConvertOptions({
                options: settings,
                overrides: this.args,
            }),
            authOverrides:
                settings?.auth != null
                    ? { auth: settings.auth }
                    : this.args.generatorsConfiguration?.api?.auth != null
                      ? { ...this.args.generatorsConfiguration.api }
                      : undefined,
            environmentOverrides:
                this.args.generatorsConfiguration?.api?.environments != null
                    ? { ...this.args.generatorsConfiguration?.api }
                    : undefined,
            globalHeaderOverrides:
                this.args.generatorsConfiguration?.api?.headers != null
                    ? { ...this.args.generatorsConfiguration?.api }
                    : undefined
        });

        return {
            absoluteFilePath: absoluteFilePath ?? this.args.absoluteFilePath,
            rootApiFile: {
                defaultUrl: definition.rootApiFile["default-url"],
                contents: definition.rootApiFile,
                rawContents: yaml.dump(definition.rootApiFile)
            },
            namedDefinitionFiles: {
                ...mapValues(definition.definitionFiles, (definitionFile) => ({
                    absoluteFilepath: absoluteFilePath ?? this.args.absoluteFilePath,
                    rawContents: yaml.dump(definitionFile),
                    contents: definitionFile
                })),
                [RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)]: {
                    absoluteFilepath: absoluteFilePath ?? this.args.absoluteFilePath,
                    rawContents: yaml.dump(definition.packageMarkerFile),
                    contents: definition.packageMarkerFile
                }
            },
            packageMarkers: {},
            importedDefinitions: {}
        };
    }
}
