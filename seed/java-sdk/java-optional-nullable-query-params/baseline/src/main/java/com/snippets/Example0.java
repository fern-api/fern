package com.snippets;

import com.seed.javaOptionalNullableQueryParams.SeedJavaOptionalNullableQueryParamsClient;
import com.seed.javaOptionalNullableQueryParams.requests.SearchRequest;
import com.seed.javaOptionalNullableQueryParams.types.SortOrder;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaOptionalNullableQueryParamsClient client = SeedJavaOptionalNullableQueryParamsClient.builder()
                .url("https://api.fern.com")
                .build();

        client.search(SearchRequest.builder()
                .query("")
                .limit(1)
                .includeArchived(true)
                .sortOrder(SortOrder.ASC)
                .optionalWithoutDefault("optionalWithoutDefault")
                .regularOptional("default-value")
                .regularOptionalNoDefault("regularOptionalNoDefault")
                .build());
    }
}
