import { FernFiddle } from "@fern-fern/fiddle-sdk";

/**
 * A structured pointer to where a generated SDK was published, derived from Fiddle's
 * `remoteTask.packages[].coordinate` (a discriminated union). Carries everything the step
 * summary needs to render `✅ Published 0.1.0 to PyPI` + `📦 <a>PyPI</a>` without any log
 * scraping — the coordinates are already structured data in the Fiddle task response.
 */
export interface PublishTarget {
    /** Machine-readable registry tag. */
    registry: "npm" | "maven" | "pypi" | "rubygems" | "nuget" | "crates";
    /** Human-readable registry name (e.g. `"PyPI"`, `"Maven Central"`). */
    label: string;
    /** Version published. */
    version: string;
    /** Canonical URL of the published package on its registry. */
    url: string;
}

/**
 * Builds a {@link PublishTarget} from the first package coordinate in Fiddle's response.
 *
 * A single SDK generation can produce multiple coordinates — e.g., Maven Central + Maven local,
 * or an npm registry override. We take the first one as "the" publish target: in practice every
 * generation is single-registry (the generator's output mode fixes the target), and even when a
 * proxy registry is involved the first coordinate is the primary one the user cares about.
 *
 * Returns undefined when the task produced no packages (local-file-system output, GitHub-only
 * commit/PR modes, or the rare `_other` coordinate variant we don't recognize).
 */
export function extractPublishTarget(packages: readonly FernFiddle.remoteGen.Package[]): PublishTarget | undefined {
    const first = packages[0];
    if (first == null) {
        return undefined;
    }
    return first.coordinate._visit<PublishTarget | undefined>({
        npm: (pkg) => ({
            registry: "npm",
            label: "npm",
            version: pkg.version,
            url: `https://www.npmjs.com/package/${pkg.name}/v/${pkg.version}`
        }),
        maven: (pkg) => ({
            registry: "maven",
            label: "Maven Central",
            version: pkg.version,
            url: `https://central.sonatype.com/artifact/${pkg.group}/${pkg.artifact}/${pkg.version}`
        }),
        pypi: (pkg) => ({
            registry: "pypi",
            label: "PyPI",
            version: pkg.version,
            url: `https://pypi.org/project/${pkg.name}/${pkg.version}/`
        }),
        ruby: (pkg) => ({
            registry: "rubygems",
            label: "RubyGems",
            version: pkg.version,
            url: `https://rubygems.org/gems/${pkg.name}/versions/${pkg.version}`
        }),
        nuget: (pkg) => ({
            registry: "nuget",
            label: "NuGet",
            version: pkg.version,
            url: `https://www.nuget.org/packages/${pkg.name}/${pkg.version}`
        }),
        crates: (pkg) => ({
            registry: "crates",
            label: "crates.io",
            version: pkg.version,
            url: `https://crates.io/crates/${pkg.name}/${pkg.version}`
        }),
        _other: () => undefined
    });
}
