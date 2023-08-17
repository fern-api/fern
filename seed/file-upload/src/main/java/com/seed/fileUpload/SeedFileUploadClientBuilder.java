package com.seed.fileUpload;

import com.seed.fileUpload.core.ClientOptions;
import com.seed.fileUpload.core.Environment;

public final class SeedFileUploadClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();

    private Environment environment;

    public SeedFileUploadClientBuilder url(String url) {
        this.environment = Environment.custom(url);
        return this;
    }

    public SeedFileUploadClient build() {
        clientOptionsBuilder.environment(this.environment);
        return new SeedFileUploadClient(clientOptionsBuilder.build());
    }
}
