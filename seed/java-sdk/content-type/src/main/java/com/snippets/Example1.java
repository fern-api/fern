package com.snippets;

import com.seed.contentTypes.SeedContentTypesClient;
import com.seed.contentTypes.resources.service.requests.PatchComplexRequest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public class Example1 {
    public static void main(String[] args) {
        SeedContentTypesClient client = SeedContentTypesClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().patchComplex(
            "id",
            PatchComplexRequest
                .builder()
                .name("name")
                .age(1)
                .active(true)
                .metadata(
                    new HashMap<String, Object>() {{
                        put("metadata", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .tags(
                    new ArrayList<String>(
                        Arrays.asList("tags", "tags")
                    )
                )
                .email("email")
                .nickname("nickname")
                .bio("bio")
                .profileImageUrl("profileImageUrl")
                .settings(
                    new HashMap<String, Object>() {{
                        put("settings", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .build()
        );
    }
}