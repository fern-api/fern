import { readFile } from "node:fs/promises";
import path from "node:path";
import { AbsoluteFilePath, getAllFilesInDirectoryRelative, join, RelativeFilePath } from "@fern-api/fs-utils";
import { APIErrorLevel, ErrorCollector } from "@fern-api/v3-importer-commons";
import { RawTwimlTag, RawTwimlTagSchema } from "./schemas.js";

const JSON_EXTENSION = ".json";
const XML_EXTENSION = ".xml";

/** A tag definition plus where it came from, keyed by its namespaced id (e.g. `voice/say`). */
export interface TwimlTagSource {
    id: string;
    relativeFilepath: RelativeFilePath;
    tag: RawTwimlTag;
}

export interface TwimlNamespaceSource {
    /** Directory / root file name, e.g. `voice`. */
    name: string;
    root: TwimlTagSource;
    /** Every tag in this namespace, including the root, keyed by id. */
    tags: Record<string, TwimlTagSource>;
}

export interface TwimlExampleSource {
    /** File stem, e.g. `say-using-language-attribute`. */
    id: string;
    relativeFilepath: RelativeFilePath;
    /** Namespace taken from the example's parent directory, when it lives in one. */
    namespace: string | undefined;
    xml: string;
}

/**
 * The on-disk TwiML spec: one `<namespace>.json` root per namespace, tags under `<namespace>/*.json`,
 * and (optionally) `.xml` example documents.
 */
export interface TwimlDocument {
    namespaces: Record<string, TwimlNamespaceSource>;
    examples: TwimlExampleSource[];
}

export async function loadTwimlDocument({
    absoluteFilepathToDefinitions,
    absoluteFilepathToExamples,
    errorCollector
}: {
    absoluteFilepathToDefinitions: AbsoluteFilePath;
    absoluteFilepathToExamples: AbsoluteFilePath | undefined;
    errorCollector: ErrorCollector;
}): Promise<TwimlDocument> {
    const namespaces = await loadNamespaces({ absoluteFilepathToDefinitions, errorCollector });
    const examples = absoluteFilepathToExamples != null ? await loadExamples({ absoluteFilepathToExamples }) : [];
    return { namespaces, examples };
}

async function loadNamespaces({
    absoluteFilepathToDefinitions,
    errorCollector
}: {
    absoluteFilepathToDefinitions: AbsoluteFilePath;
    errorCollector: ErrorCollector;
}): Promise<Record<string, TwimlNamespaceSource>> {
    const relativeFilepaths = (await getAllFilesInDirectoryRelative(absoluteFilepathToDefinitions))
        .filter((filepath) => path.extname(filepath) === JSON_EXTENSION)
        .sort((a, b) => a.localeCompare(b, "en"))
        .map(RelativeFilePath.of);

    const roots: Record<string, TwimlTagSource> = {};
    const tagsByNamespace: Record<string, Record<string, TwimlTagSource>> = {};

    for (const relativeFilepath of relativeFilepaths) {
        const tag = await readTag({
            absoluteFilepath: join(absoluteFilepathToDefinitions, relativeFilepath),
            relativeFilepath,
            errorCollector
        });
        if (tag == null) {
            continue;
        }
        const id = toTagId(relativeFilepath);
        const segments = id.split("/");
        const namespace = segments[0];
        if (namespace == null || segments.length > 2) {
            errorCollector.collect({
                level: APIErrorLevel.ERROR,
                message: `TwiML definitions must be laid out as <namespace>.json and <namespace>/<tag>.json; found ${relativeFilepath}`,
                path: [relativeFilepath]
            });
            continue;
        }
        const source: TwimlTagSource = { id, relativeFilepath, tag };
        if (segments.length === 1) {
            roots[namespace] = source;
        } else {
            (tagsByNamespace[namespace] ??= {})[id] = source;
        }
    }

    const namespaces: Record<string, TwimlNamespaceSource> = {};
    for (const [namespace, tags] of Object.entries(tagsByNamespace)) {
        if (roots[namespace] == null) {
            errorCollector.collect({
                level: APIErrorLevel.ERROR,
                message: `TwiML namespace '${namespace}' has tag definitions but no root document ${namespace}${JSON_EXTENSION}`,
                path: [namespace]
            });
        }
    }
    for (const [namespace, root] of Object.entries(roots)) {
        namespaces[namespace] = {
            name: namespace,
            root,
            tags: { [root.id]: root, ...(tagsByNamespace[namespace] ?? {}) }
        };
    }
    return namespaces;
}

async function readTag({
    absoluteFilepath,
    relativeFilepath,
    errorCollector
}: {
    absoluteFilepath: AbsoluteFilePath;
    relativeFilepath: RelativeFilePath;
    errorCollector: ErrorCollector;
}): Promise<RawTwimlTag | undefined> {
    let parsed: unknown;
    try {
        parsed = JSON.parse(await readFile(absoluteFilepath, "utf-8"));
    } catch (error) {
        errorCollector.collect({
            level: APIErrorLevel.ERROR,
            message: `Failed to parse TwiML definition ${relativeFilepath}: ${error instanceof Error ? error.message : String(error)}`,
            path: [relativeFilepath]
        });
        return undefined;
    }
    const result = RawTwimlTagSchema.safeParse(parsed);
    if (!result.success) {
        for (const issue of result.error.issues) {
            errorCollector.collect({
                level: APIErrorLevel.ERROR,
                message: `Invalid TwiML definition ${relativeFilepath}: ${issue.message}`,
                path: [relativeFilepath, ...issue.path.map(String)]
            });
        }
        return undefined;
    }
    return result.data;
}

async function loadExamples({
    absoluteFilepathToExamples
}: {
    absoluteFilepathToExamples: AbsoluteFilePath;
}): Promise<TwimlExampleSource[]> {
    const relativeFilepaths = (await getAllFilesInDirectoryRelative(absoluteFilepathToExamples))
        .filter((filepath) => path.extname(filepath) === XML_EXTENSION)
        .sort((a, b) => a.localeCompare(b, "en"))
        .map(RelativeFilePath.of);

    return Promise.all(
        relativeFilepaths.map(async (relativeFilepath) => {
            const directory = path.dirname(relativeFilepath);
            return {
                id: path.basename(relativeFilepath, XML_EXTENSION),
                relativeFilepath,
                namespace: directory === "." ? undefined : directory.split(path.sep)[0],
                xml: await readFile(join(absoluteFilepathToExamples, relativeFilepath), "utf-8")
            };
        })
    );
}

function toTagId(relativeFilepath: RelativeFilePath): string {
    return relativeFilepath.slice(0, -JSON_EXTENSION.length).split(path.sep).join("/");
}
