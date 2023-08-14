package com.seed.noEnvironment;

import com.seed.noEnvironment.core.ClientOptions;
import com.seed.noEnvironment.core.Suppliers;
import com.seed.noEnvironment.resources.dummy.DummyClient;
import java.util.function.Supplier;

public class SeedNoEnvironmentClient {
    protected final ClientOptions clientOptions;

    protected final Supplier<DummyClient> dummyClient;

    public SeedNoEnvironmentClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.dummyClient = Suppliers.memoize(() -> new DummyClient(clientOptions));
    }

    public DummyClient dummy() {
        return this.dummyClient.get();
    }

    public static SeedNoEnvironmentClientBuilder builder() {
        return new SeedNoEnvironmentClientBuilder();
    }
}
