/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.httpHead;

import com.seed.httpHead.core.ClientOptions;
import com.seed.httpHead.core.Suppliers;
import com.seed.httpHead.resources.user.UserClient;
import java.util.function.Supplier;

public class SeedHttpHeadClient {
    protected final ClientOptions clientOptions;

    protected final Supplier<UserClient> userClient;

    public SeedHttpHeadClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.userClient = Suppliers.memoize(() -> new UserClient(clientOptions));
    }

    public UserClient user() {
        return this.userClient.get();
    }

    public static SeedHttpHeadClientBuilder builder() {
        return new SeedHttpHeadClientBuilder();
    }
}
