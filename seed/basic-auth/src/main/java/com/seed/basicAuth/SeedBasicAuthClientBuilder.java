package com.seed.basicAuth;

import com.seed.basicAuth.core.ClientOptions;
import com.seed.basicAuth.core.Environment;
import java.util.Base64;

public final class SeedBasicAuthClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment;

    public SeedBasicAuthClientBuilder credentials(String username, String password) {
        String unencodedToken = username + ":" + password;
        String encodedToken = Base64.getEncoder().encodeToString(unencodedToken.getBytes());
        this.clientOptionsBuilder.addHeader("Authorization", "Basic " + encodedToken);
        return this;
    }

    public SeedBasicAuthClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    public SeedBasicAuthClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new SeedBasicAuthClient(clientOptionsBuilder.build());
    }
}
