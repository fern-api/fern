/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.authEnvironmentVariables;

import com.seed.authEnvironmentVariables.core.ClientOptions;
import com.seed.authEnvironmentVariables.core.Environment;
import java.util.Optional;
import okhttp3.OkHttpClient;

public class AsyncSeedAuthEnvironmentVariablesClientBuilder {
    private Optional<Integer> timeout = Optional.empty();

    private Optional<Integer> maxRetries = Optional.empty();

    private String apiKey = System.getenv("FERN_API_KEY");

    private String xAnotherHeader = null;

    private String xApiVersion = "01-01-2000";

    private Environment environment;

    private OkHttpClient httpClient;

    /**
     * Sets apiKey.
     * Defaults to the FERN_API_KEY environment variable.
     */
    public AsyncSeedAuthEnvironmentVariablesClientBuilder apiKey(String apiKey) {
        this.apiKey = apiKey;
        return this;
    }

    /**
     * Sets xAnotherHeader
     */
    public AsyncSeedAuthEnvironmentVariablesClientBuilder xAnotherHeader(String xAnotherHeader) {
        this.xAnotherHeader = xAnotherHeader;
        return this;
    }

    /**
     * Sets xApiVersion
     */
    public AsyncSeedAuthEnvironmentVariablesClientBuilder xApiVersion(String xApiVersion) {
        this.xApiVersion = xApiVersion;
        return this;
    }

    public AsyncSeedAuthEnvironmentVariablesClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    /**
     * Sets the timeout (in seconds) for the client. Defaults to 60 seconds.
     */
    public AsyncSeedAuthEnvironmentVariablesClientBuilder timeout(int timeout) {
        this.timeout = Optional.of(timeout);
        return this;
    }

    /**
     * Sets the maximum number of retries for the client. Defaults to 2 retries.
     */
    public AsyncSeedAuthEnvironmentVariablesClientBuilder maxRetries(int maxRetries) {
        this.maxRetries = Optional.of(maxRetries);
        return this;
    }

    /**
     * Sets the underlying OkHttp client
     */
    public AsyncSeedAuthEnvironmentVariablesClientBuilder httpClient(OkHttpClient httpClient) {
        this.httpClient = httpClient;
        return this;
    }

    protected ClientOptions buildClientOptions() {
        ClientOptions.Builder builder = ClientOptions.builder();
        setEnvironment(builder);
        setAuthentication(builder);
        setCustomHeaders(builder);
        setHttpClient(builder);
        setTimeouts(builder);
        setRetries(builder);
        setAdditional(builder);
        return builder.build();
    }

    /**
     * Sets the environment configuration for the client.
     * Override this method to modify URLs or add environment-specific logic.
     *
     * @param builder The ClientOptions.Builder to configure
     */
    protected void setEnvironment(ClientOptions.Builder builder) {
        builder.environment(this.environment);
    }

    /**
     * Override this method to customize authentication.
     * This method is called during client options construction to set up authentication headers.
     *
     * @param builder The ClientOptions.Builder to configure
     *
     * Example:
     * <pre>{@code
     * &#64;Override
     * protected void setAuthentication(ClientOptions.Builder builder) {
     *     super.setAuthentication(builder); // Keep existing auth
     *     builder.addHeader("X-API-Key", this.apiKey);
     * }
     * }</pre>
     */
    protected void setAuthentication(ClientOptions.Builder builder) {
        builder.addHeader("X-FERN-API-KEY", this.apiKey);
    }

    /**
     * Override this method to add or modify custom headers.
     * This method is called during client options construction to set up custom headers defined in the API.
     *
     * @param builder The ClientOptions.Builder to configure
     *
     * Example:
     * <pre>{@code
     * &#64;Override
     * protected void setCustomHeaders(ClientOptions.Builder builder) {
     *     super.setCustomHeaders(builder); // Keep existing headers
     *     builder.addHeader("X-Trace-ID", generateTraceId());
     * }
     * }</pre>
     */
    protected void setCustomHeaders(ClientOptions.Builder builder) {
        builder.addHeader("X-Another-Header", this.xAnotherHeader);
        builder.addHeader("X-API-Version", this.xApiVersion);
    }

    /**
     * Sets the request timeout configuration.
     * Override this method to customize timeout behavior.
     *
     * @param builder The ClientOptions.Builder to configure
     */
    protected void setTimeouts(ClientOptions.Builder builder) {
        if (this.timeout.isPresent()) {
            builder.timeout(this.timeout.get());
        }
    }

    /**
     * Sets the retry configuration for failed requests.
     * Override this method to implement custom retry strategies.
     *
     * @param builder The ClientOptions.Builder to configure
     */
    protected void setRetries(ClientOptions.Builder builder) {
        if (this.maxRetries.isPresent()) {
            builder.maxRetries(this.maxRetries.get());
        }
    }

    /**
     * Sets the OkHttp client configuration.
     * Override this method to customize HTTP client behavior (interceptors, connection pools, etc).
     *
     * @param builder The ClientOptions.Builder to configure
     */
    protected void setHttpClient(ClientOptions.Builder builder) {
        if (this.httpClient != null) {
            builder.httpClient(this.httpClient);
        }
    }

    /**
     * Override this method to add any additional configuration to the client.
     * This method is called at the end of the configuration chain, allowing you to add
     * custom headers, modify settings, or perform any other client customization.
     *
     * @param builder The ClientOptions.Builder to configure
     *
     * Example:
     * <pre>{@code
     * &#64;Override
     * protected void setAdditional(ClientOptions.Builder builder) {
     *     builder.addHeader("X-Request-ID", () -&gt; UUID.randomUUID().toString());
     *     builder.addHeader("X-Client-Version", "1.0.0");
     * }
     * }</pre>
     */
    protected void setAdditional(ClientOptions.Builder builder) {}

    /**
     * Override this method to add custom validation logic before the client is built.
     * This method is called at the beginning of the build() method to ensure the configuration is valid.
     * Throw an exception to prevent client creation if validation fails.
     *
     * Example:
     * <pre>{@code
     * &#64;Override
     * protected void validateConfiguration() {
     *     super.validateConfiguration(); // Run parent validations
     *     if (tenantId == null || tenantId.isEmpty()) {
     *         throw new IllegalStateException("tenantId is required");
     *     }
     * }
     * }</pre>
     */
    protected void validateConfiguration() {}

    public AsyncSeedAuthEnvironmentVariablesClient build() {
        if (apiKey == null) {
            throw new RuntimeException("Please provide apiKey or set the FERN_API_KEY environment variable.");
        }
        if (xAnotherHeader == null) {
            throw new RuntimeException("Please provide xAnotherHeader");
        }
        validateConfiguration();
        return new AsyncSeedAuthEnvironmentVariablesClient(buildClientOptions());
    }
}
