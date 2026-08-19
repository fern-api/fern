package com.snippets;

import com.seed.unionQueryParameters.SeedUnionQueryParametersClient;
import com.seed.unionQueryParameters.resources.events.requests.SubscribeEventsRequest;
import com.seed.unionQueryParameters.resources.events.types.EventTypeEnum;
import com.seed.unionQueryParameters.resources.events.types.EventTypeParam;
import com.seed.unionQueryParameters.resources.events.types.StringOrListParam;

public class Example0 {
    public static void main(String[] args) {
        SeedUnionQueryParametersClient client = SeedUnionQueryParametersClient.builder()
                .url("https://api.fern.com")
                .build();

        client.events()
                .subscribe(SubscribeEventsRequest.builder()
                        .eventType(EventTypeParam.of(EventTypeEnum.GROUP_CREATED))
                        .tags(StringOrListParam.of("tags"))
                        .build());
    }
}
