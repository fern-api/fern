package com.seed.plainText;

import com.seed.plainText.core.ClientOptions;
import com.seed.plainText.core.Suppliers;
import com.seed.plainText.resources.service.ServiceClient;
import java.util.function.Supplier;

public class SeedPlainTextClient {
    protected final ClientOptions clientOptions;

    protected final Supplier<ServiceClient> serviceClient;

    public SeedPlainTextClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.serviceClient = Suppliers.memoize(() -> new ServiceClient(clientOptions));
    }

    public ServiceClient service() {
        return this.serviceClient.get();
    }

    public static SeedPlainTextClientBuilder builder() {
        return new SeedPlainTextClientBuilder();
    }
}
