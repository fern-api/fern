package com.seed.fileDownload;

import com.seed.fileDownload.core.ClientOptions;
import com.seed.fileDownload.core.Suppliers;
import com.seed.fileDownload.resources.service.ServiceClient;
import java.util.function.Supplier;

public class SeedFileDownloadClient {
    protected final ClientOptions clientOptions;

    protected final Supplier<ServiceClient> serviceClient;

    public SeedFileDownloadClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.serviceClient = Suppliers.memoize(() -> new ServiceClient(clientOptions));
    }

    public ServiceClient service() {
        return this.serviceClient.get();
    }

    public static SeedFileDownloadClientBuilder builder() {
        return new SeedFileDownloadClientBuilder();
    }
}
