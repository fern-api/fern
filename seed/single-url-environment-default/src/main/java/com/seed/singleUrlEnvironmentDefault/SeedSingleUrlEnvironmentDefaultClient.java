package com.seed.singleUrlEnvironmentDefault;

import com.seed.singleUrlEnvironmentDefault.core.ClientOptions;
import com.seed.singleUrlEnvironmentDefault.core.Suppliers;
import com.seed.singleUrlEnvironmentDefault.resources.dummy.DummyClient;
import java.util.function.Supplier;

public class SeedSingleUrlEnvironmentDefaultClient {
    protected final ClientOptions clientOptions;

    protected final Supplier<DummyClient> dummyClient;

    public SeedSingleUrlEnvironmentDefaultClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.dummyClient = Suppliers.memoize(() -> new DummyClient(clientOptions));
    }

    public DummyClient dummy() {
        return this.dummyClient.get();
    }

    public static SeedSingleUrlEnvironmentDefaultClientBuilder builder() {
        return new SeedSingleUrlEnvironmentDefaultClientBuilder();
    }
}
