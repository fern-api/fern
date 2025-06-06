/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.singleProperty.resources.singleproperty;

import com.seed.singleProperty.core.ClientOptions;
import com.seed.singleProperty.core.RequestOptions;
import com.seed.singleProperty.resources.singleproperty.requests.GetThingRequest;

public class SinglePropertyClient {
    protected final ClientOptions clientOptions;

    private final RawSinglePropertyClient rawClient;

    public SinglePropertyClient(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.rawClient = new RawSinglePropertyClient(clientOptions);
    }

    /**
     * Get responses with HTTP metadata like headers
     */
    public RawSinglePropertyClient withRawResponse() {
        return this.rawClient;
    }

    public String doThing(String id) {
        return this.rawClient.doThing(id).body();
    }

    public String doThing(String id, GetThingRequest request) {
        return this.rawClient.doThing(id, request).body();
    }

    public String doThing(String id, GetThingRequest request, RequestOptions requestOptions) {
        return this.rawClient.doThing(id, request, requestOptions).body();
    }
}
