import { schemas } from "@fern-api/config";
import { RelativeFilePath, relative } from "@fern-api/fs-utils";
import { SourceLocation } from "@fern-api/source";
import { DEFAULT_API_NAME } from "../api/config/converter/ApiDefinitionConverter.js";
import { ApiSpecResolver } from "../api/resolver/ApiSpecResolver.js";
import { type Context } from "../context/Context.js";
import { getImageReferenceFromLanguage } from "../sdk/config/converter/getImageReferenceFromLanguage.js";
import type { Language } from "../sdk/config/Language.js";
import type { Target } from "../sdk/config/Target.js";
import { Version } from "../version.js";
import type { Workspace } from "./Workspace.js";

export namespace WorkspaceBuilder {
    export interface Args {
        org: string;
        lang: Language;
        resolvedSpec: ApiSpecResolver.Result;
        output: schemas.OutputObjectSchema;
        targetVersion?: string;
    }
}

export class WorkspaceBuilder {
    private readonly context: Context;

    constructor({ context }: { context: Context }) {
        this.context = context;
    }

    public async build({ org, lang, resolvedSpec, output, targetVersion }: WorkspaceBuilder.Args): Promise<Workspace> {
        const imageRef = getImageReferenceFromLanguage({ lang, version: targetVersion });
        const relativeApiPath = RelativeFilePath.of(relative(this.context.cwd, resolvedSpec.absoluteFilePath));

        const sourceLocation = new SourceLocation({
            absoluteFilePath: resolvedSpec.absoluteFilePath,
            relativeFilePath: relativeApiPath,
            line: 1,
            column: 1
        });

        const target: Target = {
            name: lang,
            api: DEFAULT_API_NAME,
            image: imageRef.image,
            registry: undefined,
            lang,
            version: imageRef.tag,
            sourceLocation,
            output: schemas.resolveOutputObjectSchema(output)
        };

        const workspace: Workspace = {
            apis: {
                [DEFAULT_API_NAME]: {
                    specs: [resolvedSpec.spec]
                }
            },
            cliVersion: Version,
            org,
            sdks: {
                org,
                targets: [target]
            }
        };

        return workspace;
    }
}
