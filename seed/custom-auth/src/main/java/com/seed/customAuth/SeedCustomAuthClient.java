package com.seed.customAuth;

import com.seed.customAuth.core.ClientOptions;
import com.seed.customAuth.core.Suppliers;
import com.seed.customAuth.resources.customauth.CustomAuthClient;
import java.util.function.Supplier;

public class SeedCustomAuthClient {
    protected final ClientOptions clientOptions;

    protected final Supplier<CustomAuthClient> customAuthClient;

    public SeedCustomAuthClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.customAuthClient = Suppliers.memoize(() -> new CustomAuthClient(clientOptions));
    }

    public CustomAuthClient customAuth() {
        return this.customAuthClient.get();
    }

    public static SeedCustomAuthClientBuilder builder() {
        return new SeedCustomAuthClientBuilder();
    }
}
