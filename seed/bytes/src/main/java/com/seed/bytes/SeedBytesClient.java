package com.seed.bytes;

import com.seed.bytes.core.ClientOptions;
import com.seed.bytes.core.Suppliers;
import com.seed.bytes.resources.service.ServiceClient;
import java.util.function.Supplier;

public class SeedBytesClient {
    protected final ClientOptions clientOptions;

    protected final Supplier<ServiceClient> serviceClient;

    public SeedBytesClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.serviceClient = Suppliers.memoize(() -> new ServiceClient(clientOptions));
    }

    public ServiceClient service() {
        return this.serviceClient.get();
    }

    public static SeedBytesClientBuilder builder() {
        return new SeedBytesClientBuilder();
    }
}
