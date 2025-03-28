/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.examples;

import com.seed.examples.core.ClientOptions;
import com.seed.examples.core.RequestOptions;
import com.seed.examples.core.Suppliers;
import com.seed.examples.resources.file.FileClient;
import com.seed.examples.resources.health.HealthClient;
import com.seed.examples.resources.service.ServiceClient;
import com.seed.examples.types.Identifier;
import com.seed.examples.types.Type;
import java.util.function.Supplier;

public class SeedExamplesClient {
    protected final ClientOptions clientOptions;

    private final RawSeedExamplesClient rawClient;

    protected final Supplier<FileClient> fileClient;

    protected final Supplier<HealthClient> healthClient;

    protected final Supplier<ServiceClient> serviceClient;

    public SeedExamplesClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.rawClient = new RawSeedExamplesClient(clientOptions);
        this.fileClient = Suppliers.memoize(() -> new FileClient(clientOptions));
        this.healthClient = Suppliers.memoize(() -> new HealthClient(clientOptions));
        this.serviceClient = Suppliers.memoize(() -> new ServiceClient(clientOptions));
    }

    /**
     * Get responses with HTTP metadata like headers
     */
    public RawSeedExamplesClient withRawResponse() {
        return this.rawClient;
    }

    public String echo(String request) {
        return this.rawClient.echo(request).body();
    }

    public String echo(String request, RequestOptions requestOptions) {
        return this.rawClient.echo(request, requestOptions).body();
    }

    public Identifier createType(Type request) {
        return this.rawClient.createType(request).body();
    }

    public Identifier createType(Type request, RequestOptions requestOptions) {
        return this.rawClient.createType(request, requestOptions).body();
    }

    public FileClient file() {
        return this.fileClient.get();
    }

    public HealthClient health() {
        return this.healthClient.get();
    }

    public ServiceClient service() {
        return this.serviceClient.get();
    }

    public static SeedExamplesClientBuilder builder() {
        return new SeedExamplesClientBuilder();
    }
}
