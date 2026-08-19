package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.vendor.requests.UpdateVendorBody;
import com.seed.api.types.UpdateVendorRequest;
import com.seed.api.types.UpdateVendorRequestStatus;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.vendor()
                .updateVendor(
                        "vendor_id",
                        UpdateVendorBody.builder()
                                .body(UpdateVendorRequest.builder()
                                        .name("name")
                                        .status(UpdateVendorRequestStatus.ACTIVE)
                                        .build())
                                .build());
    }
}
