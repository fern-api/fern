import { AbstractProject } from "@fern-api/base-generator";
import { extractErrorMessage } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";
import { copyFile, mkdir } from "fs/promises";
import { AbstractRustGeneratorContext } from "../context/AbstractRustGeneratorContext.js";
import { RustFile } from "./RustFile.js";
import { RustFilenameRegistry } from "./RustFilenameRegistry.js";

const SRC_DIRECTORY_NAME = "src";

// In the Docker execution environment (local generation), the license file is mounted here.
// For remote generation, Fiddle handles writing the LICENSE file after generation.
const DOCKER_LICENSE_PATH = "/tmp/LICENSE";

const DEFAULT_LICENSE_FILENAME = "LICENSE";

export interface RustProjectConfig {
    context: AbstractRustGeneratorContext<BaseRustCustomConfigSchema>;
    crateName: string;
    crateVersion: string;
    clientClassName: string;
}

export class RustProject extends AbstractProject<AbstractRustGeneratorContext<BaseRustCustomConfigSchema>> {
    private crateName: string;
    private crateVersion: string;
    private clientClassName: string;
    private sourceFiles: RustFile[] = [];
    private writtenLicenseFilename: string | undefined;
    public readonly filenameRegistry: RustFilenameRegistry;

    public constructor({ context, crateName, crateVersion, clientClassName }: RustProjectConfig) {
        super(context);
        this.crateName = crateName;
        this.crateVersion = crateVersion;
        this.clientClassName = clientClassName;
        this.filenameRegistry = RustFilenameRegistry.create();
    }

    public get sourceFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of(SRC_DIRECTORY_NAME);
    }

    public addSourceFiles(...files: RustFile[]): void {
        this.sourceFiles.push(...files);
    }

    public async persist(): Promise<void> {
        // Create source directory
        const absolutePathToSrcDirectory = join(this.absolutePathToOutputDirectory, this.sourceFileDirectory);
        this.context.logger.debug(`mkdir ${absolutePathToSrcDirectory}`);
        await mkdir(absolutePathToSrcDirectory, { recursive: true });

        // Write the LICENSE file before rendering templates: Cargo.toml only points at
        // `license-file` if the file actually made it into the output.
        await this.writeLicenseFile();

        // Write all template files (both source and project-level)
        await this.persistStaticSourceFiles();

        // Write all dynamic source files
        await Promise.all(this.sourceFiles.map((file) => file.write(this.absolutePathToOutputDirectory)));

        // Write raw files
        await this.writeRawFiles();
    }

    private async writeLicenseFile(): Promise<void> {
        const licenseConfig = this.context.config.license;
        if (licenseConfig?.type !== "custom") {
            return;
        }

        const filename = licenseConfig.filename ?? DEFAULT_LICENSE_FILENAME;
        const destinationPath = join(this.absolutePathToOutputDirectory, RelativeFilePath.of(filename));

        try {
            await copyFile(DOCKER_LICENSE_PATH, destinationPath);
            this.writtenLicenseFilename = filename;
            this.context.logger.debug(`Successfully copied LICENSE file to ${destinationPath}`);
        } catch (error) {
            if (error instanceof Error && "code" in error && error.code === "ENOENT") {
                // File not found is expected for remote generation, where Fiddle writes the LICENSE.
                this.context.logger.debug(
                    `Custom license file not found at ${DOCKER_LICENSE_PATH}. This is expected for remote generation.`
                );
            } else {
                this.context.logger.warn(
                    `Failed to copy custom license file from ${DOCKER_LICENSE_PATH} to ${destinationPath}: ${extractErrorMessage(error)}`
                );
            }
        }
    }

    private async persistStaticSourceFiles(): Promise<void> {
        const { context, absolutePathToOutputDirectory } = this;
        await Promise.all(
            context.getCoreAsIsFiles().map(async (def) => {
                let fileContents = await def.loadContents();

                // Replace template variables
                fileContents = this.replaceTemplateVariables(fileContents);

                const rustFile = new RustFile({
                    filename: def.filename,
                    directory: def.directory,
                    fileContents
                });
                await rustFile.write(absolutePathToOutputDirectory);
            })
        );
    }

    private replaceTemplateVariables(content: string): string {
        content = content.replace(/\{\{CLIENT_NAME\}\}/g, this.clientClassName);

        content = content.replace(/\{\{PACKAGE_NAME\}\}/g, this.crateName);
        content = content.replace(/\{\{PACKAGE_VERSION\}\}/g, this.crateVersion);

        content = content.replace(
            /\{\{PACKAGE_DESCRIPTION\}\}/g,
            this.context.customConfig.packageDescription || `Rust SDK for ${this.crateName} generated by Fern`
        );
        content = content.replace(/\{\{PACKAGE_LICENSE_FIELD\}\}/g, this.generateLicenseField());
        content = content.replace(
            /\{\{PACKAGE_REPOSITORY\}\}/g,
            this.context.customConfig.packageRepository || "https://github.com/fern-api/fern"
        );
        content = content.replace(
            /\{\{PACKAGE_DOCUMENTATION\}\}/g,
            this.context.customConfig.packageDocumentation || `https://docs.rs/${this.crateName}`
        );

        const tomlSections = this.context.dependencyManager.toTomlSections();
        content = content.replace(/\{\{EXTRA_DEPENDENCIES\}\}/g, tomlSections.dependencies);
        content = content.replace(/\{\{EXTRA_DEV_DEPENDENCIES\}\}/g, tomlSections.devDependencies);

        const retryStatusCheck =
            this.context.customConfig.retryStatusCodes === "recommended"
                ? "[408, 429, 502, 503, 504].contains(&status_code)"
                : "[408, 429].contains(&status_code) || status_code >= 500";
        content = content.replace(/\{\{RETRY_STATUS_CHECK\}\}/g, retryStatusCheck);

        if (tomlSections.features) {
            content = content.replace(/\{\{FEATURES\}\}/g, `\n[features]\n${tomlSections.features}`);
        } else {
            content = content.replace(/\{\{FEATURES\}\}/g, "");
        }

        content = content.replace(/\{\{PUBLISH_WORKFLOW\}\}/g, this.generatePublishWorkflow());

        // Conditionally include wiremock setup/teardown and test command for wire tests
        content = content.replace(/\{\{WIREMOCK_SETUP\}\}/g, this.generateWiremockSetup());
        content = content.replace(/\{\{WIREMOCK_TEARDOWN\}\}/g, this.generateWiremockTeardown());
        content = content.replace(/\{\{TEST_COMMAND\}\}/g, this.generateTestCommand());

        // Conditionally include chrono exports in prelude
        if (this.context.usesDateTime()) {
            content = content.replace(
                /\{\{CHRONO_EXPORTS\}\}/g,
                "\npub use chrono::{DateTime, FixedOffset, NaiveDate, NaiveDateTime, Utc};"
            );
        } else {
            content = content.replace(/\{\{CHRONO_EXPORTS\}\}/g, "");
        }

        // Conditionally include uuid exports in prelude
        if (this.context.usesUuid()) {
            content = content.replace(/\{\{UUID_EXPORTS\}\}/g, "\npub use uuid::Uuid;");
        } else {
            content = content.replace(/\{\{UUID_EXPORTS\}\}/g, "");
        }

        // Conditionally include ordered-float exports in prelude
        if (this.context.usesOrderedFloat()) {
            content = content.replace(
                /\{\{ORDERED_FLOAT_EXPORTS\}\}/g,
                "\npub use ordered_float::OrderedFloat;"
            );
        } else {
            content = content.replace(/\{\{ORDERED_FLOAT_EXPORTS\}\}/g, "");
        }

        // Conditionally include SerdeError import in http_client (only needed for base64 method)
        if (this.context.usesBase64()) {
            content = content.replace(/\{\{SERDE_ERROR_IMPORT\}\}/g, "use serde::de::Error as SerdeError;\n");
        } else {
            content = content.replace(/\{\{SERDE_ERROR_IMPORT\}\}/g, "");
        }

        // Conditionally include base64 import in http_client (base64 method, or basic
        // auth encoding in per-endpoint auth routing).
        if (this.context.usesBase64() || (this.context.isEndpointSecurity() && this.context.hasBasicAuthScheme())) {
            content = content.replace(/\{\{BASE64_IMPORT\}\}/g, "use base64::Engine;\n");
        } else {
            content = content.replace(/\{\{BASE64_IMPORT\}\}/g, "");
        }

        // Conditionally include multipart method in http_client
        if (this.context.hasFileUploadEndpoints()) {
            content = content.replace(
                /\{\{MULTIPART_METHOD\}\}/g,
                `    /// Execute a multipart/form-data request with the given method, path, and options
    ///
    /// This method is used for file uploads using reqwest's built-in multipart support.
    /// Note: Multipart requests are not retried because they cannot be cloned.
    ///
    /// # Example
    /// \`\`\`no_run
    /// let form = reqwest::multipart::Form::new()
    ///     .part("file", reqwest::multipart::Part::bytes(vec![1, 2, 3]));
    ///
    /// let response: MyResponse = client.execute_multipart_request(
    ///     Method::POST,
    ///     "/upload",
    ///     form,
    ///     None,
    ///     None,
    /// ).await?;
    /// \`\`\`
    #[cfg(feature = "multipart")]
    pub async fn execute_multipart_request<T>(
        &self,
        method: Method,
        path: &str,
        form: reqwest::multipart::Form,
        query_params: Option<Vec<(String, String)>>,
        options: Option<RequestOptions>,
    ) -> Result<T, ApiError>
    where
        T: DeserializeOwned,
    {
        let url = join_url(&self.config.base_url, path);
        let mut request = self.client.request(method, &url);

        // Apply query parameters if provided
        if let Some(params) = query_params {
            request = request.query(&params);
        }

        // Apply additional query parameters from options
        if let Some(opts) = &options {
            if !opts.additional_query_params.is_empty() {
                request = request.query(&opts.additional_query_params);
            }
        }

        // Use reqwest's built-in multipart support
        request = request.multipart(form);

        // Build the request
        let req = request.build().map_err(|e| ApiError::Network(e))?;

        // Multipart requests cannot be cloned, so they skip retries
        // even in the default path. With an injected executor, delegate
        // transport to the executor, applying custom headers first since
        // the executor has no knowledge of them.
        let response = if let Some(executor) = &self.executor {
            let mut req = req;
            self.apply_custom_headers(&mut req, &options)?;
            executor.execute(req).await.map_err(ApiError::Executor)?
        } else {
            let mut req = req;
            self.apply_auth_headers(&mut req, &options).await?;
            self.apply_custom_headers(&mut req, &options)?;
            let response = self.client.execute(req).await.map_err(ApiError::Network)?;
            if !response.status().is_success() {
                let status_code = response.status().as_u16();
                let body = response.text().await.ok();
                return Err(ApiError::from_response(status_code, body.as_deref()));
            }
            response
        };

        self.parse_response(response).await
    }

    /// Execute a multipart/form-data request and return a streaming response (ByteStream).
    ///
    /// This method is used for file uploads that return binary data (e.g., audio conversion).
    /// Note: Multipart requests are not retried because they cannot be cloned.
    #[cfg(feature = "multipart")]
    pub async fn execute_multipart_stream_request(
        &self,
        method: Method,
        path: &str,
        form: reqwest::multipart::Form,
        query_params: Option<Vec<(String, String)>>,
        options: Option<RequestOptions>,
    ) -> Result<ByteStream, ApiError> {
        let url = join_url(&self.config.base_url, path);
        let mut request = self.client.request(method, &url);

        // Apply query parameters if provided
        if let Some(params) = query_params {
            request = request.query(&params);
        }

        // Apply additional query parameters from options
        if let Some(opts) = &options {
            if !opts.additional_query_params.is_empty() {
                request = request.query(&opts.additional_query_params);
            }
        }

        // Use reqwest's built-in multipart support
        request = request.multipart(form);

        // Build the request
        let req = request.build().map_err(|e| ApiError::Network(e))?;

        // Multipart requests cannot be cloned, so they skip retries
        let response = if let Some(executor) = &self.executor {
            let mut req = req;
            self.apply_custom_headers(&mut req, &options)?;
            executor.execute(req).await.map_err(ApiError::Executor)?
        } else {
            let mut req = req;
            self.apply_auth_headers(&mut req, &options).await?;
            self.apply_custom_headers(&mut req, &options)?;
            let response = self.client.execute(req).await.map_err(ApiError::Network)?;
            if !response.status().is_success() {
                let status_code = response.status().as_u16();
                let body = response.text().await.ok();
                return Err(ApiError::from_response(status_code, body.as_deref()));
            }
            response
        };

        Ok(ByteStream::new(response))
    }

`
            );
        } else {
            content = content.replace(/\{\{MULTIPART_METHOD\}\}/g, "");
        }

        // Conditionally include bytes request method in http_client
        if (this.context.hasBytesEndpoints()) {
            content = content.replace(
                /\{\{BYTES_METHOD\}\}/g,
                `    /// Execute a request with a raw bytes body (application/octet-stream).
    pub async fn execute_bytes_request<T>(
        &self,
        method: Method,
        path: &str,
        body: Option<Vec<u8>>,
        query_params: Option<Vec<(String, String)>>,
        options: Option<RequestOptions>,
    ) -> Result<T, ApiError>
    where
        T: DeserializeOwned,
    {
        let url = join_url(&self.config.base_url, path);
        let mut request = self.client.request(method, &url);

        if let Some(params) = query_params {
            request = request.query(&params);
        }

        if let Some(opts) = &options {
            if !opts.additional_query_params.is_empty() {
                request = request.query(&opts.additional_query_params);
            }
        }

        if let Some(body) = body {
            request = request
                .header("Content-Type", "application/octet-stream")
                .body(body);
        }

        let req = request.build().map_err(|e| ApiError::Network(e))?;

        let response = self.send_request(req, &options).await?;
        self.parse_response(response).await
    }

`
            );
        } else {
            content = content.replace(/\{\{BYTES_METHOD\}\}/g, "");
        }

        // Conditionally include SSE method in http_client
        if (this.context.hasStreamingEndpoints()) {
            content = content.replace(
                /\{\{SSE_METHOD\}\}/g,
                `    /// Execute a request and return an SSE stream
    ///
    /// This method returns an \`SseStream<T>\` that automatically parses
    /// Server-Sent Events and deserializes the JSON data in each event.
    ///
    /// # SSE-Specific Headers
    ///
    /// In the default path, these headers are applied **after** custom headers,
    /// which means they will override any user-supplied values:
    /// - \`Accept: text/event-stream\` - Required for SSE protocol
    /// - \`Cache-Control: no-store\` - Prevents caching of streaming responses
    ///
    /// This ensures proper SSE behavior even if custom headers are provided.
    ///
    /// # Example
    /// \`\`\`no_run
    /// use futures::StreamExt;
    ///
    /// let stream = client.execute_sse_request::<CompletionChunk>(
    ///     Method::POST,
    ///     "/stream",
    ///     Some(serde_json::json!({"query": "Hello"})),
    ///     None,
    ///     None,
    ///     Some("[[DONE]]".to_string()),
    /// ).await?;
    ///
    /// let mut stream = std::pin::pin!(stream);
    /// while let Some(chunk) = stream.next().await {
    ///     let chunk = chunk?;
    ///     println!("Received: {:?}", chunk);
    /// }
    /// \`\`\`
    #[cfg(feature = "sse")]
    pub async fn execute_sse_request<T>(
        &self,
        method: Method,
        path: &str,
        body: Option<serde_json::Value>,
        query_params: Option<Vec<(String, String)>>,
        options: Option<RequestOptions>,
        terminator: Option<String>,
    ) -> Result<crate::SseStream<T>, ApiError>
    where
        T: DeserializeOwned + Send + 'static,
    {
        let url = join_url(&self.config.base_url, path);
        let mut request = self.client.request(method, &url);

        // Apply query parameters if provided
        if let Some(params) = query_params {
            request = request.query(&params);
        }

        // Apply additional query parameters from options
        if let Some(opts) = &options {
            if !opts.additional_query_params.is_empty() {
                request = request.query(&opts.additional_query_params);
            }
        }

        // Apply body if provided
        if let Some(body) = body {
            request = request.json(&body);
        }

        // Build the request
        let mut req = request.build().map_err(|e| ApiError::Network(e))?;

        // Determine per-event timeout: request-level overrides client-level
        let timeout = options
            .as_ref()
            .and_then(|opts| opts.timeout_seconds)
            .map(std::time::Duration::from_secs)
            .unwrap_or(self.config.timeout);

        let response = if let Some(executor) = &self.executor {
            self.apply_custom_headers(&mut req, &options)?;
            // SSE-specific headers applied after custom headers to ensure
            // proper SSE behavior even if custom headers are provided
            req.headers_mut().insert(
                "Accept",
                "text/event-stream"
                    .parse()
                    .map_err(|_| ApiError::InvalidHeader)?,
            );
            req.headers_mut().insert(
                "Cache-Control",
                "no-store"
                    .parse()
                    .map_err(|_| ApiError::InvalidHeader)?,
            );
            executor.execute(req).await.map_err(ApiError::Executor)?
        } else {
            self.apply_auth_headers(&mut req, &options).await?;
            self.apply_custom_headers(&mut req, &options)?;
            // SSE-specific headers applied after custom headers to ensure
            // proper SSE behavior even if custom headers are provided
            req.headers_mut().insert(
                "Accept",
                "text/event-stream"
                    .parse()
                    .map_err(|_| ApiError::InvalidHeader)?,
            );
            req.headers_mut().insert(
                "Cache-Control",
                "no-store"
                    .parse()
                    .map_err(|_| ApiError::InvalidHeader)?,
            );
            self.execute_with_retries(req, &options).await?
        };

        // Return SSE stream with per-event timeout
        crate::SseStream::new(response, terminator, timeout).await
    }

`
            );
        } else {
            content = content.replace(/\{\{SSE_METHOD\}\}/g, "");
        }

        // Conditionally include base64 method in http_client
        if (this.context.usesBase64()) {
            content = content.replace(
                /\{\{BASE64_METHOD\}\}/g,
                `    /// Execute a request that returns a base64-encoded string and decode it to bytes
    ///
    /// This method is used for endpoints that return raw base64-encoded data as a JSON string.
    /// The response is expected to be a JSON string (e.g., \`"SGVsbG8gd29ybGQh"\`) which is
    /// decoded from base64 to raw bytes.
    pub async fn execute_request_base64(
        &self,
        method: Method,
        path: &str,
        body: Option<serde_json::Value>,
        query_params: Option<Vec<(String, String)>>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<u8>, ApiError> {
        let url = join_url(&self.config.base_url, path);
        let mut request = self.client.request(method, &url);

        // Apply query parameters if provided
        if let Some(params) = query_params {
            request = request.query(&params);
        }

        // Apply additional query parameters from options
        if let Some(opts) = &options {
            if !opts.additional_query_params.is_empty() {
                request = request.query(&opts.additional_query_params);
            }
        }

        // Apply body if provided
        if let Some(body) = body {
            request = request.json(&body);
        }

        // Build the request
        let req = request.build().map_err(|e| ApiError::Network(e))?;

        let response = self.send_request(req, &options).await?;

        // Parse response as JSON string and decode base64
        let text = response.text().await.map_err(ApiError::Network)?;
        let base64_string: String = serde_json::from_str(&text).map_err(ApiError::Serialization)?;
        base64::engine::general_purpose::STANDARD
            .decode(&base64_string)
            .map_err(|e| ApiError::Serialization(SerdeError::custom(format!("base64 decode error: {}", e))))
    }
`
            );
        } else {
            content = content.replace(/\{\{BASE64_METHOD\}\}/g, "");
        }

        // Conditionally include chrono import in query_parameter_builder
        if (this.context.usesDateTime()) {
            content = content.replace(
                /\{\{QUERY_BUILDER_CHRONO_IMPORT\}\}/g,
                "use chrono::{DateTime, TimeZone};\n"
            );
        } else {
            content = content.replace(/\{\{QUERY_BUILDER_CHRONO_IMPORT\}\}/g, "");
        }

        // Conditionally include datetime/date methods in query_parameter_builder
        if (this.context.usesDateTime()) {
            content = content.replace(
                /\{\{QUERY_BUILDER_DATETIME_METHODS\}\}/g,
                `    /// Add a datetime parameter (any DateTime timezone)
    pub fn datetime<Tz: TimeZone>(mut self, key: &str, value: impl Into<Option<DateTime<Tz>>>) -> Self
    where
        Tz::Offset: std::fmt::Display,
    {
        if let Some(v) = value.into() {
            self.params.push((key.to_string(), v.to_rfc3339_opts(chrono::SecondsFormat::Secs, true)));
        }
        self
    }

    /// Add a date parameter (converts NaiveDate to DateTime<Utc>)
    pub fn date(mut self, key: &str, value: impl Into<Option<chrono::NaiveDate>>) -> Self {
        if let Some(v) = value.into() {
            // Convert NaiveDate to DateTime<Utc> at start of day
            let datetime = v.and_hms_opt(0, 0, 0).unwrap().and_utc();
            self.params.push((key.to_string(), datetime.to_rfc3339_opts(chrono::SecondsFormat::Secs, true)));
        }
        self
    }

`
            );
        } else {
            content = content.replace(/\{\{QUERY_BUILDER_DATETIME_METHODS\}\}/g, "");
        }

        // Conditionally include uuid method in query_parameter_builder
        if (this.context.usesUuid()) {
            content = content.replace(
                /\{\{QUERY_BUILDER_UUID_METHOD\}\}/g,
                `    /// Add a UUID parameter (converts to string)
    pub fn uuid(mut self, key: &str, value: impl Into<Option<uuid::Uuid>>) -> Self {
        if let Some(v) = value.into() {
            self.params.push((key.to_string(), v.to_string()));
        }
        self
    }

`
            );
        } else {
            content = content.replace(/\{\{QUERY_BUILDER_UUID_METHOD\}\}/g, "");
        }

        // Conditionally include big_int method in query_parameter_builder
        if (this.context.usesBigInteger()) {
            content = content.replace(
                /\{\{QUERY_BUILDER_BIGINT_METHOD\}\}/g,
                `    /// Add a big integer parameter (accept both required/optional)
    pub fn big_int(mut self, key: &str, value: impl Into<Option<num_bigint::BigInt>>) -> Self {
        if let Some(v) = value.into() {
            self.params.push((key.to_string(), v.to_string()));
        }
        self
    }

`
            );
        } else {
            content = content.replace(/\{\{QUERY_BUILDER_BIGINT_METHOD\}\}/g, "");
        }

        // Conditionally include chrono test imports in query_parameter_builder
        if (this.context.usesDateTime()) {
            content = content.replace(
                /\{\{QUERY_BUILDER_TEST_CHRONO_IMPORT\}\}/g,
                "\n    use chrono::{NaiveDate, TimeZone, Utc};"
            );
        } else {
            content = content.replace(/\{\{QUERY_BUILDER_TEST_CHRONO_IMPORT\}\}/g, "");
        }

        // Conditionally include uuid tests in query_parameter_builder
        if (this.context.usesUuid()) {
            content = content.replace(
                /\{\{QUERY_BUILDER_UUID_TESTS\}\}/g,
                `    #[test]
    fn test_uuid_param() {
        let id = uuid::Uuid::parse_str("550e8400-e29b-41d4-a716-446655440000").unwrap();
        let result = QueryBuilder::new().uuid("id", Some(id)).build();
        assert_eq!(
            result,
            Some(vec![(
                "id".to_string(),
                "550e8400-e29b-41d4-a716-446655440000".to_string()
            )])
        );
    }

`
            );
        } else {
            content = content.replace(/\{\{QUERY_BUILDER_UUID_TESTS\}\}/g, "");
        }

        // Conditionally include datetime tests in query_parameter_builder
        if (this.context.usesDateTime()) {
            content = content.replace(
                /\{\{QUERY_BUILDER_DATETIME_TESTS\}\}/g,
                `    #[test]
    fn test_datetime_param_formats_rfc3339() {
        let dt = Utc.with_ymd_and_hms(2024, 1, 15, 9, 30, 0).unwrap();
        let result = QueryBuilder::new().datetime("since", Some(dt)).build();
        assert_eq!(
            result,
            Some(vec![(
                "since".to_string(),
                "2024-01-15T09:30:00Z".to_string()
            )])
        );
    }

    #[test]
    fn test_date_param_converts_to_midnight_utc() {
        let date = NaiveDate::from_ymd_opt(2024, 1, 15).unwrap();
        let result = QueryBuilder::new().date("on", Some(date)).build();
        assert_eq!(
            result,
            Some(vec![(
                "on".to_string(),
                "2024-01-15T00:00:00Z".to_string()
            )])
        );
    }

`
            );
        } else {
            content = content.replace(/\{\{QUERY_BUILDER_DATETIME_TESTS\}\}/g, "");
        }

        // Conditionally include bigint tests in query_parameter_builder
        if (this.context.usesBigInteger()) {
            content = content.replace(
                /\{\{QUERY_BUILDER_BIGINT_TESTS\}\}/g,
                `    #[test]
    fn test_big_int_param() {
        let big = num_bigint::BigInt::from(999_999_999_999i64);
        let result = QueryBuilder::new().big_int("value", Some(big)).build();
        assert_eq!(
            result,
            Some(vec![("value".to_string(), "999999999999".to_string())])
        );
    }

`
            );
        } else {
            content = content.replace(/\{\{QUERY_BUILDER_BIGINT_TESTS\}\}/g, "");
        }

        // Per-endpoint auth routing (endpoint-security mode). In the default (ALL/ANY)
        // case these expand to the original flat auth body and an empty routing method,
        // so output is byte-identical. The API-key placeholders inside the flat body are
        // resolved by the replacements below.
        content = content.replace(/\{\{APPLY_AUTH_HEADERS_BODY\}\}/g, this.generateApplyAuthHeadersBody());
        content = content.replace(/\{\{ENDPOINT_AUTH_ROUTING_METHOD\}\}/g, this.generateEndpointAuthRoutingMethod());

        // Replace API key header name from IR auth schemes
        content = content.replace(/\{\{API_KEY_HEADER\}\}/g, this.context.getApiKeyHeaderName());

        // Replace API key value expression (with or without prefix)
        const apiKeyPrefix = this.context.getApiKeyPrefix();
        if (apiKeyPrefix) {
            const escapedPrefix = apiKeyPrefix.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
            content = content.replace(
                /\{\{API_KEY_VALUE_EXPR\}\}/g,
                `format!("${escapedPrefix} {}", key)`
            );
        } else {
            content = content.replace(/\{\{API_KEY_VALUE_EXPR\}\}/g, "key.to_string()");
        }

        return content;
    }

    /**
     * The body of `HttpClient::apply_auth_headers`. In the default (ALL/ANY) case this is
     * the flat auth application (API key + bearer/OAuth token) that applies all configured
     * credentials to every request. In endpoint-security mode auth is resolved per-endpoint
     * (see {@link generateEndpointAuthRoutingMethod}) and injected as request headers, so the
     * flat application is a no-op here.
     */
    private generateApplyAuthHeadersBody(): string {
        if (this.context.isEndpointSecurity()) {
            return `        // In endpoint-security mode, authentication is resolved per-endpoint via
        // resolve_endpoint_auth_headers and injected as request headers, so no
        // client-wide auth headers are applied here.
        let _ = (request, options);
        Ok(())`;
        }
        return `        let headers = request.headers_mut();

        // Apply API key (request options override config)
        let api_key = options
            .as_ref()
            .and_then(|opts| opts.api_key.as_ref())
            .or(self.config.api_key.as_ref());

        if let Some(key) = api_key {
            let header_value = {{API_KEY_VALUE_EXPR}};
            headers.insert("{{API_KEY_HEADER}}", header_value.parse().map_err(|_| ApiError::InvalidHeader)?);
        }

        // Apply bearer token - priority: request options > OAuth > config
        let token = if let Some(opts) = options.as_ref() {
            if opts.token.is_some() {
                opts.token.clone()
            } else {
                None
            }
        } else {
            None
        };

        let token = match token {
            Some(t) => Some(t),
            None => {
                // Try OAuth token provider if configured
                if let Some(oauth_config) = &self.oauth_config {
                    Some(self.get_oauth_token(oauth_config).await?)
                } else {
                    // Fall back to static token from config
                    self.config.token.clone()
                }
            }
        };

        if let Some(token) = token {
            let auth_value = format!("Bearer {}", token);
            headers.insert(
                "Authorization",
                auth_value.parse().map_err(|_| ApiError::InvalidHeader)?,
            );
        }

        Ok(())`;
    }

    /**
     * Generates `HttpClient::resolve_endpoint_auth_headers` for endpoint-security mode, or an
     * empty string otherwise (so the default output is unchanged).
     *
     * The method takes an OR-list of AND-groups of auth scheme keys (the endpoint's declared
     * `security`) and returns the headers for the first group whose schemes all have
     * credentials available. An empty requirement list means no auth. If no group is
     * satisfiable it returns an error naming the missing schemes (joined with ` AND `/` OR `).
     */
    private generateEndpointAuthRoutingMethod(): string {
        if (!this.context.isEndpointSecurity()) {
            return "";
        }

        const { tokenSchemeKeys, apiKeySchemes, basicSchemeKeys } = this.context.getEndpointAuthRoutingSchemes();
        const sections: string[] = [];

        if (tokenSchemeKeys.length > 0) {
            const inserts = tokenSchemeKeys
                .map(
                    (key) =>
                        `                available.insert(${JSON.stringify(key)}, vec![("Authorization".to_string(), auth_value.clone())]);`
                )
                .join("\n");
            sections.push(
                `        // Bearer / OAuth token schemes both resolve to \`Authorization: Bearer <token>\`.
        let token = if let Some(opts) = options.as_ref() {
            if opts.token.is_some() {
                opts.token.clone()
            } else {
                None
            }
        } else {
            None
        };
        let token = match token {
            Some(t) => Some(t),
            None => {
                if let Some(oauth_config) = &self.oauth_config {
                    Some(self.get_oauth_token(oauth_config).await?)
                } else {
                    self.config.token.clone()
                }
            }
        };
        if let Some(token) = token {
            let auth_value = format!("Bearer {}", token);
${inserts}
        }`
            );
        }

        for (const scheme of apiKeySchemes) {
            const valueExpr =
                scheme.prefix != null
                    ? `format!(${JSON.stringify(`${scheme.prefix} {}`)}, key)`
                    : "key.to_string()";
            sections.push(
                `        // Header (API key) scheme ${JSON.stringify(scheme.key)}.
        {
            let api_key = options
                .as_ref()
                .and_then(|opts| opts.api_key.as_ref())
                .or(self.config.api_key.as_ref());
            if let Some(key) = api_key {
                let header_value = ${valueExpr};
                available.insert(${JSON.stringify(scheme.key)}, vec![(${JSON.stringify(scheme.headerName)}.to_string(), header_value)]);
            }
        }`
            );
        }

        if (basicSchemeKeys.length > 0) {
            const inserts = basicSchemeKeys
                .map(
                    (key) =>
                        `                available.insert(${JSON.stringify(key)}, vec![("Authorization".to_string(), basic_value.clone())]);`
                )
                .join("\n");
            sections.push(
                `        // Basic auth schemes resolve to \`Authorization: Basic <base64(user:pass)>\`.
        if let (Some(username), Some(password)) =
            (self.config.username.as_ref(), self.config.password.as_ref())
        {
            let encoded =
                base64::engine::general_purpose::STANDARD.encode(format!("{}:{}", username, password));
            let basic_value = format!("Basic {}", encoded);
${inserts}
        }`
            );
        }

        // Inferred auth schemes are not supported by the Rust SDK, so they contribute no
        // available credentials; a requirement naming only inferred schemes is unsatisfiable.

        const availableSections = sections.length > 0 ? `\n${sections.join("\n\n")}\n` : "";

        return `
    /// Resolves the authentication headers to apply for an endpoint, given the endpoint's
    /// declared security requirements. \`requirements\` is an OR-list of AND-groups of auth
    /// scheme keys: the first group whose schemes all have credentials available is applied.
    /// An empty \`requirements\` means the endpoint requires no auth. If no group is
    /// satisfiable, an error naming the missing schemes is returned.
    pub(crate) async fn resolve_endpoint_auth_headers(
        &self,
        options: &Option<RequestOptions>,
        requirements: &[&[&str]],
    ) -> Result<HashMap<String, String>, ApiError> {
        if requirements.is_empty() {
            return Ok(HashMap::new());
        }

        let mut available: HashMap<&str, Vec<(String, String)>> = HashMap::new();
${availableSections}
        for requirement in requirements {
            if requirement
                .iter()
                .all(|scheme_key| available.contains_key(scheme_key))
            {
                let mut combined_headers = HashMap::new();
                for scheme_key in *requirement {
                    if let Some(pairs) = available.get(scheme_key) {
                        for (header_name, header_value) in pairs {
                            combined_headers.insert(header_name.clone(), header_value.clone());
                        }
                    }
                }
                return Ok(combined_headers);
            }
        }

        let missing = requirements
            .iter()
            .map(|requirement| {
                requirement
                    .iter()
                    .filter(|scheme_key| !available.contains_key(*scheme_key))
                    .copied()
                    .collect::<Vec<_>>()
                    .join(" AND ")
            })
            .collect::<Vec<_>>()
            .join(" OR ");
        Err(ApiError::Configuration(format!(
            "No authentication credentials provided that satisfy the endpoint's security requirements. Please provide credentials for: {}",
            missing
        )))
    }
`;
    }

    private generatePublishWorkflow(): string {
        // Only include publish workflow when publishConfig is set
        if (this.context.publishConfig == null) {
            return "";
        }

        return `
  publish:
    needs: [check, compile, test]
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1

      - name: Publish
        env:
          CARGO_REGISTRY_TOKEN: \${{ secrets.CARGO_REGISTRY_TOKEN }}
        run: cargo publish`;
    }

    /**
     * Generates the WireMock setup step for CI workflow when wire tests are enabled.
     * This starts the WireMock container before running tests.
     */
    private generateWiremockSetup(): string {
        if (!this.context.customConfig.enableWireTests) {
            return "";
        }

        return `
      - name: Setup WireMock server
        run: |
          if [ -f wiremock/docker-compose.test.yml ]; then
            docker compose -f wiremock/docker-compose.test.yml down 2>/dev/null || true
            docker compose -f wiremock/docker-compose.test.yml up -d --wait
            WIREMOCK_PORT=$(docker compose -f wiremock/docker-compose.test.yml port wiremock 8080 | cut -d: -f2)
            echo "WIREMOCK_URL=http://localhost:$WIREMOCK_PORT" >> $GITHUB_ENV
          fi
`;
    }

    /**
     * Generates the WireMock teardown step for CI workflow when wire tests are enabled.
     * This stops the WireMock container after running tests.
     */
    private generateWiremockTeardown(): string {
        if (!this.context.customConfig.enableWireTests) {
            return "";
        }

        return `
      - name: Teardown WireMock server
        if: always()
        run: |
          if [ -f wiremock/docker-compose.test.yml ]; then
            docker compose -f wiremock/docker-compose.test.yml down
          fi
`;
    }

    /**
     * Generates the appropriate test command based on whether wire tests are enabled.
     * When wire tests are enabled, uses RUN_WIRE_TESTS=true and --test-threads=1.
     */
    private generateTestCommand(): string {
        if (this.context.customConfig.enableWireTests) {
            return "RUN_WIRE_TESTS=true cargo test -- --test-threads=1";
        }
        return "cargo test";
    }

    /**
     * Generates the license field for Cargo.toml.
     * If packageLicenseFile is set, uses `license-file` to point to a custom license file.
     * Otherwise falls back to packageLicense, then to a custom license file this project
     * actually wrote, and finally defaults to "MIT".
     */
    private generateLicenseField(): string {
        const { packageLicense, packageLicenseFile } = this.context.customConfig;
        if (packageLicenseFile) {
            return `license-file = "${packageLicenseFile}"`;
        }
        if (packageLicense) {
            return `license = "${packageLicense}"`;
        }
        if (this.writtenLicenseFilename != null) {
            return `license-file = "${this.writtenLicenseFilename}"`;
        }
        return `license = "MIT"`;
    }

    private objectToToml(obj: unknown): string {
        if (typeof obj === "string") {
            return `"${obj}"`;
        }
        if (Array.isArray(obj)) {
            return `[${obj.map((item) => `"${item}"`).join(", ")}]`;
        }
        if (typeof obj === "object" && obj !== null) {
            const pairs = Object.entries(obj).map(([key, value]) => {
                if (typeof value === "string") {
                    return `${key} = "${value}"`;
                } else if (Array.isArray(value)) {
                    return `${key} = [${value.map((item) => `"${item}"`).join(", ")}]`;
                } else {
                    return `${key} = ${this.objectToToml(value)}`;
                }
            });
            return `{ ${pairs.join(", ")} }`;
        }
        return String(obj);
    }
}
