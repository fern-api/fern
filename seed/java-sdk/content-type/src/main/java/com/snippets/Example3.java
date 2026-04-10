package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServicePatchComplexRequest;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .patchcomplex(
                        "id",
                        ServicePatchComplexRequest.builder()
                                .name("name")
                                .age(1)
                                .active(true)
                                .metadata(new HashMap<String, Object>() {
                                    {
                                        put("metadata", new HashMap<String, Object>() {
                                            {
                                                put("key", "value");
                                            }
                                        });
                                    }
                                })
                                .tags(Optional.of(Arrays.asList("tags", "tags")))
                                .email("email")
                                .nickname("nickname")
                                .bio("bio")
                                .profileImageUrl("profileImageUrl")
                                .settings(new HashMap<String, Object>() {
                                    {
                                        put("settings", new HashMap<String, Object>() {
                                            {
                                                put("key", "value");
                                            }
                                        });
                                    }
                                })
                                .build());
    }
}
