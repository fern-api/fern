import { docsYml } from "@fern-api/configuration-loader"
import { APIV1Write } from "@fern-api/fdr-sdk"

export function convertDocsSnippetsConfigToFdr(
    snippetsConfiguration: docsYml.RawSchemas.SnippetsConfiguration | undefined
): APIV1Write.SnippetsConfig {
    if (snippetsConfiguration == null) {
        return {} as APIV1Write.SnippetsConfig
    }
    return {
        pythonSdk:
            snippetsConfiguration.python != null
                ? {
                      package:
                          typeof snippetsConfiguration.python === "string"
                              ? snippetsConfiguration.python
                              : snippetsConfiguration.python.package,
                      version:
                          typeof snippetsConfiguration.python === "string"
                              ? undefined
                              : snippetsConfiguration.python.version
                  }
                : undefined,
        typescriptSdk:
            snippetsConfiguration.typescript != null
                ? {
                      package:
                          typeof snippetsConfiguration.typescript === "string"
                              ? snippetsConfiguration.typescript
                              : snippetsConfiguration.typescript.package,
                      version:
                          typeof snippetsConfiguration.typescript === "string"
                              ? undefined
                              : snippetsConfiguration.typescript.version
                  }
                : undefined,
        goSdk:
            snippetsConfiguration.go != null
                ? {
                      githubRepo:
                          typeof snippetsConfiguration.go === "string"
                              ? snippetsConfiguration.go
                              : snippetsConfiguration.go.package,
                      version:
                          typeof snippetsConfiguration.go === "string" ? undefined : snippetsConfiguration.go.version
                  }
                : undefined,
        javaSdk:
            snippetsConfiguration.java != null
                ? {
                      coordinate:
                          typeof snippetsConfiguration.java === "string"
                              ? snippetsConfiguration.java
                              : snippetsConfiguration.java.package,
                      version:
                          typeof snippetsConfiguration.java === "string"
                              ? undefined
                              : snippetsConfiguration.java.version
                  }
                : undefined,
        rubySdk:
            snippetsConfiguration.ruby != null
                ? {
                      gem:
                          typeof snippetsConfiguration.ruby === "string"
                              ? snippetsConfiguration.ruby
                              : snippetsConfiguration.ruby.package,
                      version:
                          typeof snippetsConfiguration.ruby === "string"
                              ? undefined
                              : snippetsConfiguration.ruby.version
                  }
                : undefined,
        csharpSdk:
            snippetsConfiguration.csharp != null
                ? {
                      package:
                          typeof snippetsConfiguration.csharp === "string"
                              ? snippetsConfiguration.csharp
                              : snippetsConfiguration.csharp.package,
                      version:
                          typeof snippetsConfiguration.csharp === "string"
                              ? undefined
                              : snippetsConfiguration.csharp.version
                  }
                : undefined
    }
}
