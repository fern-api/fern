package com.seed.fileUpload;

import com.seed.fileUpload.core.ClientOptions;
import com.seed.fileUpload.core.Suppliers;
import com.seed.fileUpload.resources.service.ServiceClient;
import java.util.function.Supplier;

public class SeedFileUploadClient {
    protected final ClientOptions clientOptions;

    protected final Supplier<ServiceClient> serviceClient;

    public SeedFileUploadClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.serviceClient = Suppliers.memoize(() -> new ServiceClient(clientOptions));
    }

    public ServiceClient service() {
        return this.serviceClient.get();
    }

    public static SeedFileUploadClientBuilder builder() {
        return new SeedFileUploadClientBuilder();
    }
}
