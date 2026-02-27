import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export class UnitTestGenerator {
    private readonly context: SdkGeneratorContext;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    /**
     * Returns a raw `#[cfg(test)]` module string to be appended to config.rs
     */
    public generateConfigTests(): string {
        const hasEnvironments = this.context.ir.environments?.environments != null;
        const hasDefaultEnvironment = this.context.ir.environments?.defaultEnvironment !== undefined;

        const lines: string[] = [];
        lines.push("");
        lines.push("#[cfg(test)]");
        lines.push("mod tests {");
        lines.push("    use super::*;");
        lines.push("");

        // Test: default config has sensible defaults
        lines.push("    #[test]");
        lines.push("    fn test_default_config_has_sensible_defaults() {");
        lines.push("        let config = ClientConfig::default();");
        lines.push("        assert_eq!(config.timeout, Duration::from_secs(60));");
        lines.push("        assert_eq!(config.max_retries, 3);");
        lines.push("        assert!(config.api_key.is_none());");
        lines.push("        assert!(config.token.is_none());");
        lines.push("        assert!(config.username.is_none());");
        lines.push("        assert!(config.password.is_none());");
        lines.push("        assert!(config.client_id.is_none());");
        lines.push("        assert!(config.client_secret.is_none());");
        lines.push("        assert!(!config.user_agent.is_empty());");

        if (hasEnvironments && hasDefaultEnvironment) {
            lines.push("        assert!(!config.base_url.is_empty());");
        } else {
            lines.push("        assert!(config.base_url.is_empty());");
        }

        lines.push(
            '        assert!(config.custom_headers.contains_key("X-Fern-Language"));'
        );
        lines.push(
            '        assert_eq!(config.custom_headers.get("X-Fern-Language").unwrap(), "Rust");'
        );
        lines.push("    }");
        lines.push("");

        // Test: custom config overrides
        lines.push("    #[test]");
        lines.push("    fn test_custom_config_overrides() {");
        lines.push("        let config = ClientConfig {");
        lines.push('            base_url: "https://custom.api.com".to_string(),');
        lines.push('            api_key: Some("test-key".to_string()),');
        lines.push("            timeout: Duration::from_secs(30),");
        lines.push("            max_retries: 5,");
        lines.push("            ..Default::default()");
        lines.push("        };");
        lines.push('        assert_eq!(config.base_url, "https://custom.api.com");');
        lines.push('        assert_eq!(config.api_key.unwrap(), "test-key");');
        lines.push("        assert_eq!(config.timeout, Duration::from_secs(30));");
        lines.push("        assert_eq!(config.max_retries, 5);");
        lines.push("        assert!(config.token.is_none());");
        lines.push("    }");

        lines.push("}");
        return lines.join("\n");
    }

    /**
     * Returns a raw `#[cfg(test)]` module string to be appended to root client mod.rs
     */
    public generateClientTests(): string {
        const clientName = this.context.getClientName();

        const lines: string[] = [];
        lines.push("");
        lines.push("#[cfg(test)]");
        lines.push("mod tests {");
        lines.push("    use super::*;");
        lines.push("");

        // Test: client creation with default config
        lines.push("    #[test]");
        lines.push("    fn test_client_new_with_default_config() {");
        lines.push("        let config = ClientConfig::default();");
        lines.push(`        let client = ${clientName}::new(config);`);
        lines.push(
            '        assert!(client.is_ok(), "Client should be created successfully with default config");'
        );
        lines.push("    }");

        lines.push("}");
        return lines.join("\n");
    }

    /**
     * Generates a separate tests/unit_test.rs file with cross-module smoke tests
     */
    public generateUnitTestFile(): RustFile {
        const crateName = this.context.getCrateName();
        const clientName = this.context.getClientName();
        const hasEnvironments = this.context.ir.environments?.environments != null;
        const hasDefaultEnvironment = this.context.ir.environments?.defaultEnvironment !== undefined;

        const lines: string[] = [];
        lines.push(`use ${crateName}::config::ClientConfig;`);
        lines.push(`use ${crateName}::api::resources::${clientName};`);
        lines.push("use std::collections::HashMap;");
        lines.push("use std::time::Duration;");
        lines.push("");

        // Test: client creation with default config
        lines.push("#[test]");
        lines.push("fn test_client_creation_with_default_config() {");
        lines.push("    let config = ClientConfig::default();");
        lines.push(`    let client = ${clientName}::new(config);`);
        lines.push(
            '    assert!(client.is_ok(), "Client should be created with default config");'
        );
        lines.push("}");
        lines.push("");

        // Test: client creation with custom config
        lines.push("#[test]");
        lines.push("fn test_client_creation_with_custom_config() {");
        lines.push("    let config = ClientConfig {");
        lines.push('        base_url: "https://api.example.com".to_string(),');
        lines.push('        api_key: Some("test-api-key".to_string()),');
        lines.push("        timeout: Duration::from_secs(120),");
        lines.push("        max_retries: 5,");
        lines.push("        ..Default::default()");
        lines.push("    };");
        lines.push(`    let client = ${clientName}::new(config);`);
        lines.push(
            '    assert!(client.is_ok(), "Client should be created with custom config");'
        );
        lines.push("}");
        lines.push("");

        // Test: default headers contain Fern metadata
        lines.push("#[test]");
        lines.push("fn test_config_default_headers_contain_fern_metadata() {");
        lines.push("    let config = ClientConfig::default();");
        lines.push(
            '    assert!(config.custom_headers.contains_key("X-Fern-Language"));'
        );
        lines.push(
            '    assert!(config.custom_headers.contains_key("X-Fern-SDK-Name"));'
        );
        lines.push(
            '    assert!(config.custom_headers.contains_key("X-Fern-SDK-Version"));'
        );
        lines.push(
            '    assert_eq!(config.custom_headers.get("X-Fern-Language").unwrap(), "Rust");'
        );
        lines.push("}");

        return new RustFile({
            filename: "unit_test.rs",
            directory: RelativeFilePath.of("tests"),
            fileContents: lines.join("\n")
        });
    }
}
