import {
    type FernConfigMappingDiagnostic,
    type SdkConfigV1PackageConfig,
    type SdkConfigV1PublishConfig
} from "@postman/sdk-config/sdk-config/v1";
import type { Language } from "../../../../sdk/config/Language.js";
import type { Target } from "../../../../sdk/config/Target.js";

export declare namespace PublicationMapper {
    export interface Args {
        index: number;
        target: Target;
    }

    export interface Result {
        diagnostics: FernConfigMappingDiagnostic[];
        package?: SdkConfigV1PackageConfig;
        publish?: SdkConfigV1PublishConfig;
    }
}

type PublishConfig = NonNullable<Target["publish"]>;
type DiagnosticPath = (string | number)[];
type FernPublishField = keyof PublishConfig;
type RegistryMappingArgs = { prefix: DiagnosticPath; publish: PublishConfig };

interface PublicationMapping<
    FernLanguage extends Language = Language,
    FernField extends FernPublishField = FernPublishField,
    SdkRegistry extends SdkConfigV1PublishConfig["registry"] = SdkConfigV1PublishConfig["registry"]
> {
    language: FernLanguage;
    fernPublishField: FernField;
    sdkConfigRegistry: SdkRegistry;
}

abstract class AbstractRegistryPublicationMapper<
    FernLanguage extends Language,
    FernField extends FernPublishField,
    SdkRegistry extends SdkConfigV1PublishConfig["registry"]
> {
    constructor(public readonly mapping: PublicationMapping<FernLanguage, FernField, SdkRegistry>) {}

    public abstract map({ prefix, publish }: RegistryMappingArgs): PublicationMapper.Result | undefined;

    protected credentialDiagnostics(
        prefix: DiagnosticPath,
        registry: string,
        field: string,
        value: unknown
    ): FernConfigMappingDiagnostic[] {
        if (value == null) {
            return [];
        }
        return [
            {
                code: "FERN_OUTPUT_CREDENTIAL_UNSUPPORTED",
                severity: "warning",
                path: [...prefix, registry, field],
                reason: "Fern output credentials and signatures are not represented by SDK Config v1",
                suggestedAction: "Configure publication credentials and signing secrets outside SDK Config."
            }
        ];
    }
}

class NpmPublicationMapper extends AbstractRegistryPublicationMapper<"typescript", "npm", "npm"> {
    public map({ prefix, publish }: RegistryMappingArgs): PublicationMapper.Result | undefined {
        const npm = publish[this.mapping.fernPublishField];
        if (npm == null) {
            return undefined;
        }
        return {
            diagnostics: this.credentialDiagnostics(prefix, "npm", "token", npm.token),
            package: { packageName: npm.packageName },
            publish: { registry: this.mapping.sdkConfigRegistry, ...(npm.url == null ? {} : { url: npm.url }) }
        };
    }
}

class PypiPublicationMapper extends AbstractRegistryPublicationMapper<"python", "pypi", "pypi"> {
    public map({ prefix, publish }: RegistryMappingArgs): PublicationMapper.Result | undefined {
        const pypi = publish[this.mapping.fernPublishField];
        if (pypi == null) {
            return undefined;
        }
        return {
            diagnostics: [
                ...this.credentialDiagnostics(prefix, "pypi", "token", pypi.token),
                ...this.credentialDiagnostics(prefix, "pypi", "username", pypi.username),
                ...this.credentialDiagnostics(prefix, "pypi", "password", pypi.password)
            ],
            package: {
                packageName: pypi.packageName,
                ...(pypi.metadata?.keywords == null ? {} : { keywords: pypi.metadata.keywords }),
                ...(pypi.metadata?.documentationLink == null
                    ? {}
                    : { documentationUrl: pypi.metadata.documentationLink }),
                ...(pypi.metadata?.homepageLink == null ? {} : { homepage: pypi.metadata.homepageLink })
            },
            publish: { registry: this.mapping.sdkConfigRegistry, ...(pypi.url == null ? {} : { url: pypi.url }) }
        };
    }
}

class MavenPublicationMapper extends AbstractRegistryPublicationMapper<"java", "maven", "maven"> {
    public map({ prefix, publish }: RegistryMappingArgs): PublicationMapper.Result | undefined {
        const maven = publish[this.mapping.fernPublishField];
        if (maven == null) {
            return undefined;
        }
        const [groupId, artifactId, extra] = maven.coordinate.split(":");
        const diagnostics = [
            ...this.credentialDiagnostics(prefix, "maven", "username", maven.username),
            ...this.credentialDiagnostics(prefix, "maven", "password", maven.password),
            ...this.credentialDiagnostics(prefix, "maven", "signature", maven.signature)
        ];
        if (!groupId || !artifactId || extra != null) {
            return {
                diagnostics: [
                    ...diagnostics,
                    {
                        code: "FERN_PUBLICATION_UNSUPPORTED",
                        severity: "warning",
                        path: [...prefix, "maven.coordinate"],
                        reason: "Maven coordinates must use groupId:artifactId format",
                        suggestedAction: "Set target.output.publish and target.package manually in SDK Config v1."
                    }
                ]
            };
        }
        return {
            diagnostics,
            package: { groupId, artifactId },
            publish: { registry: this.mapping.sdkConfigRegistry, ...(maven.url == null ? {} : { url: maven.url }) }
        };
    }
}

class NugetPublicationMapper extends AbstractRegistryPublicationMapper<"csharp", "nuget", "nuget"> {
    public map({ prefix, publish }: RegistryMappingArgs): PublicationMapper.Result | undefined {
        const nuget = publish[this.mapping.fernPublishField];
        if (nuget == null) {
            return undefined;
        }
        return {
            diagnostics: this.credentialDiagnostics(prefix, "nuget", "apiKey", nuget.apiKey),
            package: { packageName: nuget.packageName },
            publish: { registry: this.mapping.sdkConfigRegistry, ...(nuget.url == null ? {} : { url: nuget.url }) }
        };
    }
}

class RubygemsPublicationMapper extends AbstractRegistryPublicationMapper<"ruby", "rubygems", "rubygems"> {
    public map({ prefix, publish }: RegistryMappingArgs): PublicationMapper.Result | undefined {
        const rubygems = publish[this.mapping.fernPublishField];
        if (rubygems == null) {
            return undefined;
        }
        return {
            diagnostics: this.credentialDiagnostics(prefix, "rubygems", "apiKey", rubygems.apiKey),
            package: { packageName: rubygems.packageName },
            publish: {
                registry: this.mapping.sdkConfigRegistry,
                ...(rubygems.url == null ? {} : { url: rubygems.url })
            }
        };
    }
}

class CratesPublicationMapper extends AbstractRegistryPublicationMapper<"rust", "crates", "crates"> {
    public map({ prefix, publish }: RegistryMappingArgs): PublicationMapper.Result | undefined {
        const crates = publish[this.mapping.fernPublishField];
        if (crates == null) {
            return undefined;
        }
        return {
            diagnostics: this.credentialDiagnostics(prefix, "crates", "token", crates.token),
            package: { packageName: crates.packageName },
            publish: { registry: this.mapping.sdkConfigRegistry, ...(crates.url == null ? {} : { url: crates.url }) }
        };
    }
}

interface PublicationMappersByLanguage {
    csharp: NugetPublicationMapper;
    go?: undefined;
    java: MavenPublicationMapper;
    php?: undefined;
    python: PypiPublicationMapper;
    ruby: RubygemsPublicationMapper;
    rust: CratesPublicationMapper;
    swift?: undefined;
    typescript: NpmPublicationMapper;
}

const PUBLICATION_MAPPERS_BY_LANGUAGE: PublicationMappersByLanguage = {
    csharp: new NugetPublicationMapper({
        language: "csharp",
        fernPublishField: "nuget",
        sdkConfigRegistry: "nuget"
    }),
    java: new MavenPublicationMapper({
        language: "java",
        fernPublishField: "maven",
        sdkConfigRegistry: "maven"
    }),
    python: new PypiPublicationMapper({
        language: "python",
        fernPublishField: "pypi",
        sdkConfigRegistry: "pypi"
    }),
    ruby: new RubygemsPublicationMapper({
        language: "ruby",
        fernPublishField: "rubygems",
        sdkConfigRegistry: "rubygems"
    }),
    rust: new CratesPublicationMapper({
        language: "rust",
        fernPublishField: "crates",
        sdkConfigRegistry: "crates"
    }),
    typescript: new NpmPublicationMapper({
        language: "typescript",
        fernPublishField: "npm",
        sdkConfigRegistry: "npm"
    })
};

/** Maps Fern package publication settings to SDK Config package and publish blocks. */
export class PublicationMapper {
    public map({ index, target }: PublicationMapper.Args): PublicationMapper.Result {
        if (target.publish == null) {
            return { diagnostics: [] };
        }
        const prefix = ["group", "generators", index, "publish"];
        const mapper = PUBLICATION_MAPPERS_BY_LANGUAGE[target.lang];
        const result = mapper?.map({ prefix, publish: target.publish });
        if (result != null) {
            return result;
        }
        return {
            diagnostics: [
                {
                    code: "FERN_PUBLICATION_UNSUPPORTED",
                    severity: "warning",
                    path: [...prefix, target.lang],
                    reason: `No matching publication configuration exists for ${target.lang}`,
                    suggestedAction: "Set target.output.publish and target.package manually in SDK Config v1."
                }
            ]
        };
    }
}
