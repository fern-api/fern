package com.seed.errorProperty;

import com.seed.errorProperty.core.ClientOptions;
import com.seed.errorProperty.core.Suppliers;
import com.seed.errorProperty.resources.propertybasederror.PropertyBasedErrorClient;
import java.util.function.Supplier;

public class SeedErrorPropertyClient {
    protected final ClientOptions clientOptions;

    protected final Supplier<PropertyBasedErrorClient> propertyBasedErrorClient;

    public SeedErrorPropertyClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.propertyBasedErrorClient = Suppliers.memoize(() -> new PropertyBasedErrorClient(clientOptions));
    }

    public PropertyBasedErrorClient propertyBasedError() {
        return this.propertyBasedErrorClient.get();
    }

    public static SeedErrorPropertyClientBuilder builder() {
        return new SeedErrorPropertyClientBuilder();
    }
}
