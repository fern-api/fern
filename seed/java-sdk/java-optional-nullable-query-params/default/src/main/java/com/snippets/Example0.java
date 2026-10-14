package com.snippets;

import com.seed.javaOptionalNullableQueryParams.SeedJavaOptionalNullableQueryParamsClient;
import com.seed.javaOptionalNullableQueryParams.core.OptionalNullable;
import com.seed.javaOptionalNullableQueryParams.requests.SearchRequest;
import com.seed.javaOptionalNullableQueryParams.types.SortOrder;
import java.util.Arrays;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaOptionalNullableQueryParamsClient client = SeedJavaOptionalNullableQueryParamsClient.builder()
                .url("https://api.fern.com")
                .build();

        client.search(SearchRequest.builder()
                .query(OptionalNullable.of("query"))
                .sortOrders(Arrays.asList(SortOrder.ASC, SortOrder.DESC))
                .tags(Arrays.asList("tag1", "tag2"))
                .build());
    }
}
